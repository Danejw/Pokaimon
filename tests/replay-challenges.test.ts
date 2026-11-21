import { describe, expect, it, vi } from 'vitest';
import { applyMove, createBattle, switchModel } from '../src/battle/engine';
import { INITIAL_MODEL, MODELS } from '../src/content/core';
import { makeEncounter, encodeChallengeCode, decodeChallengeCode } from '../src/content/variants';
import { CHALLENGES, getChallenge, evaluateChallenge } from '../src/content/challenges';
import { buildBattleReplay, restoreBattleReplay } from '../src/battle/replay';
import { loadProgress, saveProgress, recordChallengeCompletion } from '../src/storage/progress';

describe('Phase 4: deterministic variations and challenge constraints',()=>{
  it('does not mutate static encounter templates and makes reproducible variants',()=>{
    const a=makeEncounter('task',101,['extra-audit']);
    const b=makeEncounter('task',101,['extra-audit']);
    const changed=makeEncounter('task',102,['counter-rotation']);
    expect(a).toEqual(b);
    expect(a).not.toBeNull();
    expect(a!.stages[2].goal).toBe(48);
    expect(makeEncounter('task',101,[])!.stages[2].goal).toBe(36);
    expect(changed!.specialEffect).not.toEqual(makeEncounter('task',101,['counter-rotation'])!.specialEffect);
    expect(makeEncounter('unknown',101,[])).toBeNull();
    expect(makeEncounter('task',101,['not-a-modifier' as 'extra-audit'])).toBeNull();
  });
  it('separates challenge rule difficulty from display difficulty and enforces budgets',()=>{
    const scenario=makeEncounter('task',101,['tight-budget'])!;
    const state=createBattle(scenario,INITIAL_MODEL,101);
    expect(state.ap).toBe(5);
    expect(state.maxTurns).toBe(8);
    expect(state.seed).toBe(101);
  });
  it('parses only bounded, versioned, known challenge codes',()=>{
    const code=encodeChallengeCode({encounterId:'research',seed:202,modifierIds:['counter-rotation']});
    expect(decodeChallengeCode(code)).toEqual({encounterId:'research',seed:202,modifierIds:['counter-rotation']});
    for(const value of ['PK0.task.101.extra-audit','PK1.task.abc.extra-audit',
      'PK1.not-real.1.extra-audit','PK1.task.1.invalid',
      'PK1.task.1.extra-audit\n<script>','PK1.'+'a'.repeat(1000)]){
      expect(decodeChallengeCode(value)).toBeNull();
    }
  });
  it('each authored challenge has at least one complete deterministic winning strategy',()=>{
    const audit=getChallenge('audit-task')!;
    const auditScene=makeEncounter(audit.encounterId,audit.seed,audit.modifierIds)!;
    let a=createBattle(auditScene,INITIAL_MODEL,audit.seed);
    for(const move of ['deep-think','code-execution','self-correction','self-correction'])
      a=applyMove(a,move,INITIAL_MODEL,auditScene);
    expect(evaluateChallenge(audit,a)).toBe(true);

    const relay=getChallenge('relay-bug')!;
    const relayScene=makeEncounter(relay.encounterId,relay.seed,relay.modifierIds)!;
    let b=createBattle(relayScene,MODELS[1],relay.seed);
    b=applyMove(b,'max-reasoning',MODELS[1],relayScene);
    b=switchModel(b,'astra',relayScene,MODELS);
    for(const move of ['deep-think','code-execution','self-correction'])
      b=applyMove(b,move,INITIAL_MODEL,relayScene);
    expect(evaluateChallenge(relay,b)).toBe(true);

    const research=getChallenge('source-check')!;
    const researchScene=makeEncounter(research.encounterId,research.seed,research.modifierIds)!;
    let c=createBattle(researchScene,INITIAL_MODEL,research.seed);
    for(const move of ['deep-think','deep-research','self-correction'])
      c=applyMove(c,move,INITIAL_MODEL,researchScene);
    expect(evaluateChallenge(research,c)).toBe(true);
  });
  it('tracks win conditions from real events rather than claimed wins',()=>{
    expect(CHALLENGES).toHaveLength(3);
    const task=getChallenge('audit-task')!;
    const encounter=makeEncounter(task.encounterId,task.seed,task.modifierIds)!;
    let state=createBattle(encounter,INITIAL_MODEL,task.seed);
    for(const id of ['deep-think','code-execution','self-correction','self-correction'])
      state=applyMove(state,id,INITIAL_MODEL,encounter);
    expect(state.outcome).toBe('won');
    expect(evaluateChallenge(task,state)).toBe(true);
    expect(evaluateChallenge(task,{...state,outcome:'lost'})).toBe(false);
    expect(evaluateChallenge({...task,id:'relay-bug',objective:'switch'},state)).toBe(false);
    const relay={...state,events:[...state.events,{seq:999,turn:4,kind:'MODEL_SWITCHED' as const,modelId:'grok',message:'Switch'}]};
    expect(evaluateChallenge({...task,id:'relay-bug',objective:'switch'},relay)).toBe(true);
  });
});

describe('Phase 4: reproducible battles and earned local achievements',()=>{
  it('replays a switched battle from a bounded action log, checking its digest',()=>{
    const encounter=makeEncounter('task',101,['extra-audit'])!;
    const squad=MODELS.slice(0,3);
    let state=createBattle(encounter,INITIAL_MODEL,101,squad);
    state=applyMove(state,'deep-think',INITIAL_MODEL,encounter);
    state=switchModel(state,'grok',encounter,squad);
    state=applyMove(state,'code-review',MODELS[1],encounter);
    state=switchModel(state,'astra',encounter,squad);
    state=applyMove(state,'self-correction',INITIAL_MODEL,encounter);
    state=applyMove(state,'self-correction',INITIAL_MODEL,encounter);
    const replay=buildBattleReplay(state,{encounterId:'task',modifierIds:['extra-audit'],roster:squad});
    const reconstructed=restoreBattleReplay(replay);
    expect(reconstructed).toEqual(state);
    expect(restoreBattleReplay({...replay,checksum:'tampered'})).toBeNull();
    expect(restoreBattleReplay({...replay,contentVersion:999})).toBeNull();
    expect(restoreBattleReplay({...replay,actions:Array(100).fill({kind:'move',id:'deep-think'})})).toBeNull();
  });
  it('records challenge clears and achievements once, preserving legacy v3 state',()=>{
    const data=new Map<string,string>([['pokaimon:progress:v3',JSON.stringify({
      schema:3,cleared:['task'],missionsCleared:['workshop-task'],
      teamIds:['astra','grok','fable'],discoveredMoves:['deep-think'],
      winsByModel:{astra:1},useAlternateLoadout:false,
    })]]);
    vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});
    const loaded=loadProgress();
    expect(loaded.schema).toBe(4);
    expect(loaded.missionsCleared).toEqual(['workshop-task']);
    const challenge=getChallenge('audit-task')!;
    let state=createBattle(makeEncounter(challenge.encounterId,challenge.seed,challenge.modifierIds)!,INITIAL_MODEL,challenge.seed);
    for(const id of ['deep-think','code-execution','self-correction','self-correction'])
      state=applyMove(state,id,INITIAL_MODEL,makeEncounter(challenge.encounterId,challenge.seed,challenge.modifierIds)!);
    const gained=recordChallengeCompletion(loaded,challenge,state,null);
    expect(gained.challengesCleared).toEqual(['audit-task']);
    expect(gained.achievements).toContain('first-challenge');
    expect(recordChallengeCompletion(gained,challenge,state,null)).toEqual(gained);
    saveProgress(gained);
    expect(loadProgress()).toEqual(gained);
    vi.unstubAllGlobals();
  });
});
