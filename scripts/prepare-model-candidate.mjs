#!/usr/bin/env node
// Review-only candidate importer. No network, paid APIs, writes, or publishing.
// Usage: node scripts/prepare-model-candidate.mjs --stdin < release-manifest.json
import { readFileSync } from 'node:fs';

function fail(message) {
  process.stderr.write(message + '\n');
  process.exitCode = 1;
}
try {
  const source = process.argv[2] === '--stdin' ? readFileSync(0,'utf8') :
    process.argv.length === 3 ? readFileSync(process.argv[2],'utf8') : null;
  if(source === null || source.length > 10000)throw Error('Provide a small JSON source manifest path or --stdin.');
  const manifest=JSON.parse(source);
  if(!manifest || Array.isArray(manifest) || typeof manifest!=='object')throw Error('Expected an object.');
  const {id,provider,displayName,version,sourceUrl,recordedAt}=manifest;
  if(typeof id!=='string'|| !/^[a-z0-9-]{2,48}$/.test(id))throw Error('Invalid stable model ID.');
  if(![provider,displayName,version].every(s=>typeof s==='string'&&s.trim().length>0&&s.length<=100))
    throw Error('Provider, name and version required.');
  let url;
  try { url=new URL(sourceUrl); } catch { throw Error('Invalid evidence URL.'); }
  if(url.protocol!=='https:' || url.username || url.password || !url.hostname || /[<>"'\\\s]/.test(sourceUrl))
    throw Error('Evidence URL must be a safe HTTPS link.');
  if(typeof recordedAt!=='string'|| !/^\d{4}-\d{2}-\d{2}$/.test(recordedAt))
    throw Error('recordedAt must be YYYY-MM-DD.');
  const result={
    schemaVersion:1,id,
    publicationStatus:'candidate',
    facts:{provider,displayName,version,sourceUrl,recordedAt,reviewStatus:'pending',
      verifiedCapabilities:[]},
    description:'Game identity and capabilities require review.',
    moveIds:[],
    palette:'#8ca9ae',
    balance:{focus:null,tempo:null,precision:null,patch:'unreviewed'},
    reviewChecklist:['Verify official source and current model identity',
      'Document supported capabilities with dated evidence',
      'Choose four valid moves and fictional balance stats',
      'Review original sprite or generic fallback',
      'Run roster and battle solvability CI before publishing'],
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
} catch(error) { fail(error instanceof Error?error.message:'Candidate import failed.'); }
