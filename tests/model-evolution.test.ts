import { describe, expect, it } from 'vitest';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot=process.cwd();
const cli=resolve(repoRoot,'scripts/evolve-models.mjs');
function sandbox(){
  const root=mkdtempSync(join(tmpdir(),'pokaimon-evolution-'));
  for(const path of ['src/content/generatedModels.json','src/game/generatedSprites.json',
    'data/model-observations.json','data/model-seeds.json']){
    mkdirSync(dirname(resolve(root,path)),{recursive:true});
    cpSync(resolve(repoRoot,path),resolve(root,path));
  }
  return root;
}
function scan(root:string,fixture:string) {
  const result=spawnSync(process.execPath,[cli,'--fixture',resolve(repoRoot,'tests/fixtures/'+fixture),'--apply'],{
    cwd:root,encoding:'utf8',timeout:10000,
  });
  if(result.status!==0)throw Error(result.stderr||result.stdout);
  return JSON.parse(result.stdout) as {
    changed:boolean;baselineChanged:boolean;added:{gameId:string;evolvesFrom:string|null}[];
    held:{reason:string}[];
  };
}
const read=(root:string,path:string)=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
describe('Phase 8 automatic, deterministic model evolution',()=>{
  it('first official inventory is bootstrapped without publishing old releases',()=>{
    const root=sandbox();
    try {
      const result=scan(root,'model-inventory-boot.json');
      expect(result.changed).toBe(false);
      expect(result.baselineChanged).toBe(true);
      expect(read(root,'src/content/generatedModels.json')).toHaveLength(0);
      expect(read(root,'data/model-observations.json').knownIds.openai).toContain('gpt-88-1');
    } finally {rmSync(root,{recursive:true,force:true});}
  });
  it('subsequent official release evolves once, with reproducible original art',()=>{
    const root=sandbox();
    try {
      scan(root,'model-inventory-boot.json');
      const first=scan(root,'model-inventory-new.json');
      expect(first.changed).toBe(true);
      expect(first.added).toHaveLength(1);
      expect(first.added[0].evolvesFrom).toBe('astra');
      const models=read(root,'src/content/generatedModels.json');
      expect(models).toHaveLength(1);
      expect(models[0].publicationStatus).toBe('approved');
      expect(models[0].facts.reviewStatus).toBe('reviewed');
      expect(models[0].facts.verifiedCapabilities).toEqual([]); // no fabricated capabilities
      expect(models[0].moveIds).toHaveLength(4);
      expect(models[0].passiveId).toMatch(/analysis-boost|audit-ward|verification-link/);
      const sprites=read(root,'src/game/generatedSprites.json');
      expect(sprites[first.added[0].gameId].pixels).toHaveLength(32);
      expect(sprites[first.added[0].gameId].pixels.every((row:string)=>row.length===32)).toBe(true);
      const frozen=JSON.stringify(sprites);
      expect(scan(root,'model-inventory-new.json').changed).toBe(false);
      expect(JSON.stringify(read(root,'src/game/generatedSprites.json'))).toBe(frozen);
      expect(read(root,'src/content/generatedModels.json')).toHaveLength(1);
    } finally {rmSync(root,{recursive:true,force:true});}
  });
  it('invalid official evidence never publishes a new character',()=>{
    const root=sandbox();
    try {
      const state=read(root,'data/model-observations.json');
      state.initializedProviders=['xai'];
      state.knownIds.xai=['grok-4.7'];
      writeFileSync(resolve(root,'data/model-observations.json'),JSON.stringify(state));
      const result=scan(root,'model-inventory-unsafe.json');
      expect(result.changed).toBe(false);
      expect(result.held).toEqual(expect.arrayContaining([expect.objectContaining({reason:'untrusted-source'})]));
      expect(read(root,'src/content/generatedModels.json')).toHaveLength(0);
      expect(existsSync(resolve(root,'data/model-scan-report.json'))).toBe(true);
    } finally {rmSync(root,{recursive:true,force:true});}
  });
});