import {describe,expect,it} from 'vitest';
import {spawnSync} from 'node:child_process';
function run(body:string) {
  const res=spawnSync(process.execPath,['--input-type=module','-e',body],{
    encoding:'utf8',cwd:process.cwd(),timeout:5000,
  });
  if(res.status!==0)throw Error(res.stderr);
  return JSON.parse(res.stdout) as Record<string,unknown>;
}
describe('Phase 8 provider adapters and lineage eligibility',()=>{
  it('normalizes provider listing formats and rejects aliases and unrelated models',()=>{
    const result=run("import {normalizeListing} from './scripts/lib/provider-adapters.mjs';"+
      "const openai=normalizeListing('openai',{data:[{id:'gpt-6.3'},{id:'gpt-6.3-latest'},{id:'whisper-1'}]});"+
      "const anthropic=normalizeListing('anthropic',{data:[{id:'claude-opus-5-6',display_name:'Claude Opus 5.6'},{id:'claude-opus-5-6-preview'}]});"+
      "const xai=normalizeListing('xai',{data:[{id:'grok-4.8'},{id:'grok-4.8-latest'}]});"+
      "console.log(JSON.stringify({openai,anthropic,xai}));");
    expect(result.openai).toEqual([{id:'gpt-6.3',displayName:'gpt-6.3'}]);
    expect(result.anthropic).toEqual([{id:'claude-opus-5-6',displayName:'Claude Opus 5.6'}]);
    expect(result.xai).toEqual([{id:'grok-4.8',displayName:'grok-4.8'}]);
  });
  it('only accepts official HTTPS pages naming the exact release and marks missing API keys',()=>{
    const data=run("import {verifyOfficialDocument,listOfficialModels} from './scripts/lib/provider-adapters.mjs';"+
      "const fake=(body)=>async()=>new Response(body,{status:200,headers:{'content-type':'text/html'}});"+
      "const a=await verifyOfficialDocument('openai',{id:'gpt-6.3'},fake('<main>Introducing gpt-6.3</main>'));"+
      "const b=await verifyOfficialDocument('openai',{id:'gpt-6.3'},fake('<main>Introducing gpt-6.2</main>'));"+
      "const missing=await listOfficialModels('xai',{});"+
      "console.log(JSON.stringify({a,b,missing}));");
    expect((data.a as {verified:boolean}).verified).toBe(true);
    expect((data.b as {verified:boolean}).verified).toBe(false);
    expect((data.missing as {status:string}).status).toBe('missing-key');
  });
  it('compares versions numerically, keeps branches separate, and creates repeatable art',()=>{
    const data=run("import {classifyModel,versionCompare,getParent,originalSprite,validSprite} from './scripts/lib/evolution-core.mjs';"+
      "const parent={provider:'anthropic',familyId:'anthropic:opus',branchKey:'standard',gameId:'opus55',version:'5.5',generation:0};"+
      "const next=classifyModel('anthropic','claude-opus-5-6');"+
      "const fork=classifyModel('anthropic','claude-opus-5-6-fast');"+
      "const asset=originalSprite('ev-anthropic-claude-opus-5-6','anthropic:opus',1);"+
      "console.log(JSON.stringify({nextParent:getParent(next,[parent])?.gameId,forkParent:getParent(fork,[parent]),"+
      "cmp:versionCompare('5.10','5.9'),artValid:validSprite(asset),"+
      "artStable:JSON.stringify(asset)===JSON.stringify(originalSprite('ev-anthropic-claude-opus-5-6','anthropic:opus',1))}));");
    expect(data.nextParent).toBe('opus55');
    expect(data.forkParent).toBe(null);
    expect((data.cmp as number)).toBeGreaterThan(0);
    expect(data.artValid).toBe(true);
    expect(data.artStable).toBe(true);
  });
});
