import { describe, expect, it } from 'vitest';
import { MODELS, MOVES, TASK, validateRoster } from '../src/content/core';
import { createBattle, applyMove } from '../src/battle/engine';
import type { BattleState, ModelDefinition } from '../src/battle/types';

function canWin(model: ModelDefinition): boolean {
  let frontier: BattleState[] = [createBattle(TASK,model)];
  const visited = new Set<string>();
  for(let depth=0; depth<6; depth++) {
    const next: BattleState[] = [];
    for(const state of frontier) {
      if(state.outcome==='won') return true;
      for(const id of model.moveIds){
        const trial = applyMove(state,id,model,TASK);
        if(trial.outcome==='won')return true;
        if(trial.outcome!=='active')continue;
        const key=[trial.stageIndex, trial.ap, ...trial.progress, ...trial.goals].join(':');
        if(!visited.has(key)){visited.add(key);next.push(trial);}
      }
    }
    frontier=next;
  }
  return false;
}
describe('model and move library',()=>{
  it('contains four versioned models with four equipped moves each',()=>{
    expect(validateRoster()).toEqual([]);
    expect(MODELS).toHaveLength(4);
    expect(MODELS.map(m=>m.moveIds.length)).toEqual([4,4,4,4]);
  });
  it('every model can complete TASK using its own moves',()=>{
    for(const model of MODELS)expect(canWin(model), model.displayName).toBe(true);
  });
  it('rejects invalid move or absent source metadata',()=>{
    expect(validateRoster([{...MODELS[0],moveIds:['missing','deep-think','deep-research','code-execution']}])).toContain('astra has unknown move: missing');
    expect(validateRoster([{...MODELS[0],source:'broken'}])).toContain('Source missing: astra');
    expect(Object.keys(MOVES).length).toBeGreaterThanOrEqual(8);
  });
});