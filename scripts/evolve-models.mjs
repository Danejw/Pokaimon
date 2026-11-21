#!/usr/bin/env node
/**
 * Pokaimon official-model evolution pipeline. Pure Node, no inference calls.
 * Never publishes executable source or accepts untrusted remote instructions.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { SUPPORTED_PROVIDERS, compileEvolution, existingRegistry } from './lib/evolution-core.mjs';
import { listOfficialModels, verifyOfficialDocument } from './lib/provider-adapters.mjs';

const args=process.argv.slice(2);
function option(flag){const at=args.indexOf(flag);return at>=0?args[at+1]:null;}
const fixture=option('--fixture');
const applying=args.includes('--apply');
const live=args.includes('--live');
const validateOnly=args.includes('--validate-only');
const root=process.cwd();
const outRoot=resolve(option('--output-root')??root);
if((!!fixture===!!live) && !validateOnly){
  process.stderr.write('Choose exactly one of --fixture FILE or --live.\n');process.exit(2);
}
function readJson(file,fallback){
  try{return JSON.parse(readFileSync(resolve(root,file),'utf8'));}
  catch(error){if(error?.code==='ENOENT')return fallback;throw error;}
}
function writeJson(file,data){
  const location=resolve(outRoot,file);mkdirSync(dirname(location),{recursive:true});
  writeFileSync(location,JSON.stringify(data,null,2)+'\n','utf8');
}
function assertValidCatalog(entries,sprites){
  if(!Array.isArray(entries)||!sprites||typeof sprites!=='object')throw Error('Invalid generated catalog structure');
  const ids=new Set();
  for(const entry of entries){
    if(!entry||!/^ev-[a-z0-9-]{3,45}$/.test(entry.id)||ids.has(entry.id))throw Error('Invalid or duplicate generated game ID');
    ids.add(entry.id);
    if(entry.publicationStatus!=='approved'||entry.facts?.reviewStatus!=='reviewed'||
       !SUPPORTED_PROVIDERS.includes(String(entry.familyId).split(':')[0]))throw Error('Unreviewed model in published catalog');
    if(!entry.facts?.providerModelId||!entry.sourceDigest||!entry.firstSeenAt)throw Error('Provenance missing');
    if(!Array.isArray(entry.moveIds)||entry.moveIds.length!==4||new Set(entry.moveIds).size!==4)throw Error('Illegal move loadout');
    if(!sprites[entry.id]||sprites[entry.id].pixels?.length!==32)throw Error('Sprite missing or malformed');
  }
  for(const entry of entries){
    if(entry.evolvesFrom===entry.id)throw Error('Self-referential evolution');
  }
  return true;
}
const generated=readJson('src/content/generatedModels.json',[]);
const sprites=readJson('src/game/generatedSprites.json',{});
const seed=readJson('data/model-seeds.json',[]);
const observations=readJson('data/model-observations.json',{initializedProviders:[],knownIds:{}});
if(!Array.isArray(observations.initializedProviders)||!observations.knownIds||
    typeof observations.knownIds!=='object')throw Error('Invalid observation state');
assertValidCatalog(generated,sprites);
if(validateOnly){console.log(JSON.stringify({valid:true,generated:generated.length}));process.exit(0);}
const fixtureData=fixture?JSON.parse(readFileSync(resolve(root,fixture),'utf8')):null;
if(fixtureData && (!Array.isArray(fixtureData.sources)||fixtureData.sources.length>3))
  throw Error('Fixture must contain at most three provider sources');
const seenKeys=new Set([...seed.map(x=>x.provider+':'+x.officialModelId),
  ...generated.map(x=>({p:x.familyId.split(':')[0],id:x.facts.providerModelId})).map(x=>x.p+':'+x.id)]);
const known=existingRegistry(seed,generated.map(e=>({
  provider:e.familyId.split(':')[0],officialModelId:e.facts.providerModelId,gameId:e.id,generation:e.generation??0,
})));
const initialModels=generated.length,changes=[],holds=[],statuses=[],bootstrapped=[];
const today=new Date().toISOString().slice(0,10);
for(const provider of SUPPORTED_PROVIDERS){
  let listing;
  if(fixtureData){
    const source=fixtureData.sources.find(x=>x.provider===provider);
    if(!source)continue;
    listing={provider,status:'ok',models:source.models};
  }else listing=await listOfficialModels(provider);
  statuses.push({provider,status:listing.status,seen:listing.models?.length??0});
  if(listing.status!=='ok')continue;
  const entries=listing.models??[];
  if(entries.length>400)throw Error('Inventory out of bounds');
  if(!observations.knownIds[provider])observations.knownIds[provider]=[];
  const previously=new Set(observations.knownIds[provider]);
  const thisScan=new Set(entries.map(item=>item.id).filter(id=>typeof id==='string'));
  if(!observations.initializedProviders.includes(provider)){
    observations.initializedProviders.push(provider);
    observations.knownIds[provider]=[...new Set([...previously,...thisScan])].sort();
    bootstrapped.push(provider);
    continue; // First listing establishes baseline. Do not publish a backlog of historical models.
  }
  let accepted=0;
  for(const model of entries){
    if(!model||typeof model.id!=='string'||previously.has(model.id)||seenKeys.has(provider+':'+model.id))continue;
    // Rate-limit new published models per provider, and avoid flooding the catalog.
    if(accepted>=2){holds.push({provider,id:model.id,reason:'daily-cap'});continue;}
    let evidence;
    if(fixtureData){
      const listed=fixtureData.sources.find(x=>x.provider===provider);
      const matching=listed?.models.find(x=>x.id===model.id);
      evidence=matching?.officialEvidence===true?
        {verified:true,sourceUrl:matching.sourceUrl}:{verified:false,reason:'fixture-without-evidence'};
    }else evidence=await verifyOfficialDocument(provider,model);
    if(!evidence.verified){
      holds.push({provider,id:model.id,reason:evidence.reason});continue;
    }
    const compiled=compileEvolution(provider,{...model,...evidence},known,seenKeys,today);
    if(compiled.hold){holds.push({provider,id:model.id,reason:compiled.hold});continue;}
    if(sprites[compiled.entry.id]||generated.some(e=>e.id===compiled.entry.id)){
      holds.push({provider,id:model.id,reason:'duplicate-game-id'});continue;
    }
    generated.push(compiled.entry);
    sprites[compiled.entry.id]=compiled.art;
    seenKeys.add(compiled.modelKey);
    known.push({...compiled.lineage,officialModelId:model.id});
    changes.push({provider,id:model.id,gameId:compiled.entry.id,evolvesFrom:compiled.entry.evolvesFrom});
    accepted++;
  }
  // Remember accepted IDs; held candidates are retried on later scans.
  const newlyAccepted=changes.filter(x=>x.provider===provider).map(x=>x.id);
  observations.knownIds[provider]=[...new Set([...previously,...thisScan].filter(id=>
    !holds.some(h=>h.provider===provider && h.id===id && h.reason!=='already-known') ||
    previously.has(id) || newlyAccepted.includes(id)))].sort();
}
assertValidCatalog(generated,sprites);
const result={formatVersion:1,mode:fixture?'fixture':'live',changed:changes.length>0,
  baselineChanged:bootstrapped.length>0,added:changes,bootstrapped,held:holds,statuses,
  generatedCount:generated.length,initialModels,
  // Provenance is stored per generated model; no user or API-key data is logged.
};
if(applying){
  writeJson('src/content/generatedModels.json',generated);
  writeJson('src/game/generatedSprites.json',sprites);
  writeJson('data/model-observations.json',observations);
  // Workflow uploads this report; it must never be used as a source of playable models.
  writeJson('data/model-scan-report.json',result);
}
console.log(JSON.stringify(result));
