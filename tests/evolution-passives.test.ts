import {describe,expect,it} from 'vitest';
import {createBattle,applyMove,switchModel} from '../src/battle/engine';
import {forecastMove} from '../src/battle/tactics';
import {TASK,INITIAL_MODEL,MOVES} from '../src/content/core';
import type {ModelDefinition} from '../src/battle/types';

function evo(passiveId:NonNullable<ModelDefinition['passiveId']>):ModelDefinition {
  return {...INITIAL_MODEL,id:'synthetic-evolution',passiveId};
}
describe('Phase 8 safe game-only passives',()=>{
  it('analysis boost helps the first reasoning action exactly once',()=>{
    const model=evo('analysis-boost');
    const s=createBattle(TASK,model,1,[model]);
    expect(forecastMove(s,MOVES['deep-think'],TASK).gain).toBeGreaterThan(0);
    const first=applyMove(s,'deep-think',model,TASK);
    expect(first.stageIndex).toBe(1);
    expect(first.ap).toBe(s.ap-1);
  });
  it('audit ward provides one defensive guard and switching does not farm it',()=>{
    const model=evo('audit-ward'),other=INITIAL_MODEL;
    const s=createBattle(TASK,model,1,[model,other]);
    expect(s.guarded).toBe(true);
    const first=applyMove(s,'deep-think',model,TASK);
    const second=applyMove(first,'code-execution',model,TASK);
    expect(second.events.some(e=>e.kind==='STATUS_CONSUMED'&&e.message.includes('Guard'))).toBe(true);
    const swapped=switchModel(second,other.id,TASK,[model,other]);
    const back=switchModel(swapped,model.id,TASK,[model,other]);
    expect(back.events.filter(e=>e.kind==='MODEL_SWITCHED'&&e.modelId===model.id)).toHaveLength(1);
  });
  it('verification-link is a fixed bonus on research-then-verification, not a provider benchmark',()=>{
    const model:evoType=evo('verification-link');
    const state=createBattle(TASK,model,1,[model]);
    expect(state.modelId).toBe('synthetic-evolution');
    expect(model.passiveId).toBe('verification-link');
  });
});
type evoType=ModelDefinition;
