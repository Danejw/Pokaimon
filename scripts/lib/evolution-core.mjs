import { createHash } from 'node:crypto';

export const SUPPORTED_PROVIDERS=['openai','anthropic','xai'];
export const ALLOWED_DOC_HOSTS={
  openai:['developers.openai.com'],
  anthropic:['platform.claude.com'],
  xai:['docs.x.ai','x.ai'],
};
const MOVES={
  tactical:['deep-think','code-execution','deep-research','self-correction'],
  methodical:['extended-thinking','code-review','deep-research','self-correction'],
  explorer:['max-reasoning','code-review','parallel-search','self-correction'],
  versatile:['context-recall','code-review','deep-research','self-correction'],
};
export function digest(value) {
  return createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
}
export function classifyModel(provider,id){
  if(!SUPPORTED_PROVIDERS.includes(provider)||typeof id!=='string'||id.length>80||
      !/^[a-z0-9][a-z0-9._-]*$/.test(id) || /(?:^|[-_.])(latest|preview|alias)(?:$|[-_.])/.test(id) ||
      /(?:^|[-_.])20\d{2}[-_.]?\d{2}[-_.]?\d{2}$/.test(id))return null;
  let family='',version='',branch='standard';
  if(provider==='openai'){
    const m=/^(gpt)-(\d+)(?:[.-](\d+))?(?:-(astra|pro|mini|nano|codex))?$/.exec(id);
    if(!m)return null;family=m[1];version=m[2]+'.'+(m[3]??'0');branch=m[4]??'standard';
  }else if(provider==='anthropic'){
    const m=/^claude-(opus|sonnet|fable|haiku)-(\d+)-(\d+)(?:-(mini|fast))?$/.exec(id);
    if(!m)return null;family=m[1];version=m[2]+'.'+m[3];branch=m[4]??'standard';
  }else{
    const m=/^grok-(\d+)(?:\.(\d+))?(?:-(fast|mini|reasoning))?$/.exec(id);
    if(!m)return null;family='grok';version=m[1]+'.'+(m[2]??'0');branch=m[3]??'standard';
  }
  return {provider,officialModelId:id,familyId:provider+':'+family,version,branchKey:branch};
}
export function parseVersion(value){
  return String(value).split('.').map(s=>Number(s)).filter(Number.isFinite);
}
export function versionCompare(a,b){
  const x=parseVersion(a),y=parseVersion(b);
  for(let i=0;i<Math.max(x.length,y.length);i++){
    if((x[i]??0)!==(y[i]??0))return (x[i]??0)-(y[i]??0);
  }return 0;
}
function stableId(provider,officialModelId){
  const slug=('ev-'+provider+'-'+officialModelId).toLowerCase().replace(/[^a-z0-9-]/g,'-');
  return slug.length<=48?slug:slug.slice(0,37)+'-'+digest(slug).slice(0,9);
}
export function getParent(classification,known){
  const same=known.filter(x=>x.provider===classification.provider &&
    x.familyId===classification.familyId && x.branchKey===classification.branchKey &&
    versionCompare(x.version,classification.version)<0);
  same.sort((a,b)=>versionCompare(b.version,a.version));
  return same[0]??null;
}
export function originalSprite(modelId,familyId,generation=0){
  const seed=Number.parseInt(digest(modelId).slice(0,8),16)>>>0;
  const cells=Array.from({length:32},()=>Array(32).fill('.'));
  const rect=(k,x,y,w,h)=>{
    for(let row=Math.max(0,y);row<Math.min(32,y+h);row++)
      for(let col=Math.max(0,x);col<Math.min(32,x+w);col++)cells[row][col]=k;
  };
  const variant=seed%4;
  // The same family retains its helmet, eye spacing and palette, while forms add original crests.
  const hue=Number.parseInt(digest(familyId).slice(0,6),16);
  const red=70+(hue%95),green=95+((hue>>>7)%80),blue=115+((hue>>>15)%80);
  const toHex=(r,g,b)=>(r<<16)|(g<<8)|b;
  const palette={
    K:0x293447,D:toHex(red,green,blue),M:toHex(Math.min(red+35,245),Math.min(green+25,245),Math.min(blue+22,245)),
    L:0xd8e7d5,W:0xfff6dc,T:0x5ce4b5,Y:0xffcc7a,R:0xe786a4,
  };
  rect('K',7,8,18,21);rect('D',8,9,16,19);rect('M',9,11,14,14);
  rect('K',10,12,12,10);rect('W',11,13,10,8);
  rect('K',12,15,3,3);rect('K',17,15,3,3);
  rect('T',13,15,1,1);rect('T',18,15,1,1);
  rect('K',14,19,4,1);rect('R',15,20,2,1);
  rect('K',9,28,6,3);rect('K',17,28,6,3);
  if(variant===0){rect('K',6,5,5,5);rect('Y',7,6,3,3);}
  if(variant===1){rect('K',21,4,5,6);rect('T',22,5,3,4);}
  if(variant===2){rect('K',5,9,4,9);rect('Y',6,10,2,7);}
  if(variant===3){rect('K',23,10,5,9);rect('T',24,11,3,7);}
  const trait=(generation+seed)%3;
  if(trait===0){rect('K',13,4,6,5);rect('Y',14,5,4,3);}
  else if(trait===1){rect('K',3,17,5,5);rect('T',4,18,3,3);}
  else {rect('K',24,19,5,5);rect('R',25,20,3,3);}
  rect('K',11,29,4,2);rect('K',18,29,4,2);
  return {pixelSize:3,palette,pixels:cells.map(row=>row.join(''))};
}
export function validSprite(sprite){
  if(!sprite||sprite.pixelSize!==3||!Array.isArray(sprite.pixels)||sprite.pixels.length!==32||
    !sprite.pixels.every(row=>typeof row==='string'&&row.length===32))return false;
  const allowed=new Set(Object.keys(sprite.palette??{}).concat(['.']));
  const symbols=new Set(sprite.pixels.join(''));
  return [...symbols].every(c=>allowed.has(c))&&symbols.size>=6 &&
    sprite.pixels[0][0]==='.' && sprite.pixels[31][31]==='.';
}
export function compileEvolution(provider,record,known,existingIds,checkedAt){
  const classification=classifyModel(provider,record.id);
  if(!classification)return {hold:'unsupported-id-or-alias'};
  if(existingIds.has(provider+':'+record.id))return {hold:'already-known'};
  if(record.officialEvidence!==true||typeof record.sourceUrl!=='string')
    return {hold:'missing-official-evidence'};
  let host;
  try{const url=new URL(record.sourceUrl);if(url.protocol!=='https:'||url.username||url.password)throw Error();host=url.hostname;}
  catch{return {hold:'invalid-source-url'};}
  if(!ALLOWED_DOC_HOSTS[provider].includes(host))return {hold:'untrusted-source'};
  const parent=getParent(classification,known);
  const id=stableId(provider,record.id),generation=(parent?.generation??-1)+1;
  const kitNames=['tactical','methodical','explorer','versatile'];
  const kit=kitNames[Number.parseInt(digest(record.id).slice(0,2),16)%kitNames.length];
  const art=originalSprite(id,classification.familyId,generation);
  if(!validSprite(art))return {hold:'invalid-generated-art'};
  const attrs=[3,4,5],index=Number.parseInt(digest(record.id).slice(2,4),16);
  const balance={focus:attrs[index%3],tempo:attrs[(index+1)%3],precision:attrs[(index+2)%3],patch:'auto-v1'};
  const entry={
    id,publicationStatus:'approved',
    facts:{provider:provider==='xai'?'xAI':provider==='openai'?'OpenAI':'Anthropic',
      displayName:record.displayName??record.id,
      version:classification.version,sourceUrl:record.sourceUrl,recordedAt:checkedAt,
      reviewStatus:'reviewed',providerModelId:record.id,verifiedCapabilities:[]},
    description:'A game-balanced new AI evolution. Its moves and stats are fictional; follow the official source for real capabilities.',
    moveIds:MOVES[kit],palette:'#'+(art.palette.M>>>0).toString(16).padStart(6,'0'),
    balance,
    passiveId:['analysis-boost','audit-ward','verification-link'][Number.parseInt(digest(record.id).slice(4,6),16)%3],
    familyId:classification.familyId,branchKey:classification.branchKey,
    evolvesFrom:parent?.gameId??null,generation,firstSeenAt:checkedAt,
    sourceDigest:digest(record.sourceUrl+'|'+record.id),
  };
  return {entry,art,modelKey:provider+':'+record.id,
    lineage:{provider,gameId:id,familyId:classification.familyId,branchKey:classification.branchKey,
      version:classification.version,generation}};
}
export function existingRegistry(legacy,generated){
  const parsed=legacy.concat(generated).map(item=>{
    const c=classifyModel(item.provider,item.officialModelId);
    return c?{...c,gameId:item.gameId,generation:item.generation??0}:null;
  }).filter(Boolean);
  return parsed;
}
