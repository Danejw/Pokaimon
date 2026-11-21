import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';

const valid={
  id:'sample-model',provider:'Fictional AI Labs',displayName:'Sample Model 1',
  version:'1',sourceUrl:'https://example.org/releases/model-1',recordedAt:'2026-11-20',
};
function importManifest(data:unknown) {
  return spawnSync(process.execPath,['scripts/prepare-model-candidate.mjs','--stdin'],{
    encoding:'utf8',input:JSON.stringify(data),timeout:3000,
  });
}
describe('Phase 5: safe local candidate preparation',()=>{
  it('produces a nonplayable unreviewed candidate without invented capabilities or power',()=>{
    const result=importManifest(valid);
    expect(result.status).toBe(0);
    const candidate=JSON.parse(result.stdout);
    expect(candidate.publicationStatus).toBe('candidate');
    expect(candidate.facts.reviewStatus).toBe('pending');
    expect(candidate.facts.verifiedCapabilities).toEqual([]);
    expect(candidate.moveIds).toEqual([]);
    expect(candidate.balance.focus).toBeNull();
    expect(candidate.reviewChecklist.length).toBeGreaterThan(3);
  });
  it('rejects unsafe source, unknown metadata and invalid IDs',()=>{
    for(const bad of [
      {...valid,sourceUrl:'javascript:alert(1)'},
      {...valid,sourceUrl:'http://example.org/model'},
      {...valid,id:'../../danger'},
      {...valid,provider:''},
      {...valid,recordedAt:'yesterday'},
    ]) {
      const result=importManifest(bad);
      expect(result.status,JSON.stringify(bad)).not.toBe(0);
      expect(result.stdout).toBe('');
    }
  });
});
