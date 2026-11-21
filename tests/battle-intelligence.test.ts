import { describe, expect, it } from 'vitest';
import { createBattle, applyMove, inspectHydraEvidence } from '../src/battle/engine';
import { HYDRA } from '../src/content/intelligentEncounters';
import { INITIAL_MODEL, MODELS } from '../src/content/core';
import { buildBattleReplay, restoreBattleReplay } from '../src/battle/replay';
import { makeEncounter } from '../src/content/variants';

function begin() {return createBattle(HYDRA,INITIAL_MODEL,601,MODELS.slice(0,3));}
function attack(state: ReturnType<typeof begin>,moveId:string) {
  return applyMove(state,moveId,INITIAL_MODEL,HYDRA);
}
describe('Phase 6A: Hallucination Hydra decision',()=>{
  it('reveals a meaningful clue with a single turn and no AP; rejects repeats',()=>{
    const start=begin();
    expect(start.hydra?.clueKnown).toBe(false);
    const observed=inspectHydraEvidence(start,'source-duplicate',HYDRA);
    expect(observed.turn).toBe(1);
    expect(observed.ap).toBe(start.ap);
    expect(observed.hydra?.clueKnown).toBe(true);
    expect(observed.events.filter(e=>e.kind==='CLUE_FOUND')).toHaveLength(1);
    expect(inspectHydraEvidence(observed,'source-duplicate',HYDRA)).toBe(observed);
    expect(inspectHydraEvidence(start,'invalid',HYDRA)).toBe(start);
  });

  it('a cautious inspection prevents the Echo Chamber penalty',()=>{
    let state=inspectHydraEvidence(begin(),'source-duplicate',HYDRA);
    state=attack(state,'deep-think');
    expect(state.stageIndex).toBe(1);
    expect(state.hydra?.falseConfidence).toBe(0);
    expect(state.goals[1]).toBe(HYDRA.stages[1].goal);
    expect(state.events.some(e=>e.kind==='ENEMY_ACTED'&&e.message.includes('blocked'))).toBe(true);
  });

  it('ignoring evidence creates a different recoverable battle path',()=>{
    let state=attack(begin(),'deep-think');
    state=attack(state,'deep-research');
    expect(state.hydra?.falseConfidence).toBe(1);
    expect(state.goals[2]).toBe(HYDRA.stages[2].goal+16);
    state=attack(state,'self-correction');
    expect(state.outcome).toBe('active');
    state=attack(state,'self-correction');
    expect(state.outcome).toBe('won');
  });

  it('both cautious and rushed strategies can win deterministically',()=>{
    let cautious=inspectHydraEvidence(begin(),'source-duplicate',HYDRA);
    for(const move of ['deep-think','deep-research','self-correction']) cautious=attack(cautious,move);
    expect(cautious.outcome).toBe('won');
    let rushed=begin();
    for(const move of ['deep-think','deep-research','self-correction','self-correction']) rushed=attack(rushed,move);
    expect(rushed.outcome).toBe('won');
    expect(cautious.ap).toBeGreaterThan(rushed.ap);
    expect(cautious.events.map(e=>e.kind)).not.toEqual(rushed.events.map(e=>e.kind));
  });

  it('records inspection as a replayable typed action',()=>{
    const encounter=makeEncounter('hydra',601,[]);
    expect(encounter?.id).toBe('hydra');
    let state=inspectHydraEvidence(begin(),'source-duplicate',HYDRA);
    for(const move of ['deep-think','deep-research','self-correction']) state=attack(state,move);
    const replay=buildBattleReplay(state,{encounterId:'hydra',modifierIds:[],roster:MODELS.slice(0,3)});
    expect(replay.actions[0]).toEqual({kind:'inspect',id:'source-duplicate'});
    expect(restoreBattleReplay(replay)).toEqual(state);
  });
});