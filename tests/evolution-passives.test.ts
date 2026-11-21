import {describe,expect,it} from 'vitest';
import {createBattle,applyMove,switchModel} from '../src/battle/engine';
import {forecastMove} from '../src/battle/tactics';
import {TASK,INITIAL_MODEL,MOVES} from '../src/content/core';
import {RESEARCH} from '../src/content/encounters';
import type {ModelDefinition} from '../src/battle/types';

function evo(passiveId:NonNullable<ModelDefinition['passiveId']>):ModelDefinition {
  return {...INITIAL_MODEL,id:'synthetic-evolution',passiveId};
}
describe('Phase 8 preapproved fictional passives',()=>{
  it('analysis boost helps only first-turn reasoning',()=>{
    const model=evo('analysis-boost');
    const encounter={...TASK,stages:TASK.stages.map((stage,i)=>i===0?{...stage,goal:48}:stage)};
    const s=createBattle(encounter,model,1,[model]);
    const predicted=forecastMove(s,MOVES['deep-think'],encounter);
    const boosted=applyMove(s,'deep-think',model,encounter);
    const plain=applyMove(createBattle(encounter,{...model,passiveId:undefined},1,[model]),
      'deep-think',{...model,passiveId:undefined},encounter);
    expect(boosted.stageIndex).toBe(1);
    expect(plain.stageIndex).toBe(0);
    expect(predicted.gain).toBeLessThanOrEqual(boosted.goals[0]);
  });
  it('audit ward provides one guard and switching does not duplicate earlier effects',()=>{
    const model=evo('audit-ward'),other=INITIAL_MODEL;
    const s=createBattle(TASK,model,1,[model,other]);
    expect(s.guarded).toBe(true);
    const first=applyMove(s,'deep-think',model,TASK);
    const second=applyMove(first,'code-execution',model,TASK);
    expect(second.events.some(e=>e.kind==='STATUS_CONSUMED'&&e.message.includes('Guard'))).toBe(true);
    const swapped=switchModel(second,other.id,TASK,[model,other]);
    const back=switchModel(swapped,model.id,TASK,[model,other]);
    expect(back.events.filter(e=>e.kind==='MODEL_SWITCHED'&&e.modelId===model.id)).toHaveLength(1);
    expect(back.guarded).toBe(false);
  });
  it('verification link adds exactly eight to an eligible Research → Verification combo',()=>{
    const model=evo('verification-link');
    const encounter={...RESEARCH,stages:RESEARCH.stages.map((stage,i)=>i===2?{...stage,goal:80}:stage)};
    const run=(character:ModelDefinition)=>{
      let state=createBattle(encounter,character,1,[character]);
      for(const id of ['deep-think','deep-research','self-correction'])
        state=applyMove(state,id,character,encounter);
      return state;
    };
    const withLink=run(model);
    const without=run({...model,passiveId:undefined});
    expect(withLink.progress[2]-without.progress[2]).toBe(8);
    expect(withLink.outcome).toBe('active');
  });
});
