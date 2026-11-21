import { describe, it, expect, vi } from 'vitest';
import { ENCOUNTERS, canUseModel, isUnlocked, validateEncounters } from '../src/content/encounters';
import { MODELS } from '../src/content/core';
import { createBattle, applyMove } from '../src/battle/engine';
import type { BattleState, ModelDefinition, EncounterDefinition } from '../src/battle/types';
import { defaultProgress, loadProgress, markCleared, saveProgress } from '../src/storage/progress';

function canWin(model:ModelDefinition,encounter:EncounterDefinition):boolean{
  let frontier:BattleState[]=[createBattle(encounter,model)];
  const visited=new Set<string>();
  for(let turn=0;turn<=6;turn++){
    const next:BattleState[]=[];
    for(const state of frontier){
      if(state.outcome==='won')return true;
      for(const id of model.moveIds){
        const trial=applyMove(state,id,model,encounter);
        if(trial.outcome==='won')return true;
        if(trial.outcome!=='active')continue;
        const key=[trial.stageIndex,trial.ap,...trial.progress,...trial.goals].join('|');
        if(!visited.has(key)){visited.add(key);next.push(trial);}
      }
    }
    frontier=next;
  }
  return false;
}
describe('encounter campaign',()=>{
  it('defines five distinct validated challenge sequences',()=>{
    expect(validateEncounters()).toEqual([]);expect(ENCOUNTERS).toHaveLength(5);
    expect(ENCOUNTERS.map(x=>x.specialEffect)).toEqual(['scope-shift','regression','source-conflict','hidden-assumption','false-lead']);
  });
  it('every encounter has a feasible winning strategy with at least one model',()=>{
    for(const encounter of ENCOUNTERS)
      expect(MODELS.some(model=>canUseModel(encounter,model)&&canWin(model,encounter)),encounter.id).toBe(true);
  });
  it('progressively unlocks encounters',()=>{
    expect(isUnlocked('task',[])).toBe(true);
    expect(isUnlocked('bug',[])).toBe(false);
    expect(isUnlocked('bug',['task'])).toBe(true);
    expect(isUnlocked('research',['task'])).toBe(false);
    expect(isUnlocked('research',['task','bug'])).toBe(true);
  });
  it('persisted progress survives reload and corrupt storage',()=>{
    const map=new Map<string,string>();
    vi.stubGlobal('localStorage',{getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>map.set(k,v)});
    const p=markCleared({...defaultProgress,teamIds:[...defaultProgress.teamIds]},'task');saveProgress(p);expect(loadProgress()).toEqual(p);
    expect(markCleared(p,'task')).toBe(p);
    map.set('pokaimon:progress:v3','broken');expect(loadProgress()).toEqual(defaultProgress);
    vi.unstubAllGlobals();
  });
  it('regression reopens completed coding stage',()=>{
    const e=ENCOUNTERS[1],m=MODELS[0];
    let s=createBattle(e,m);s=applyMove(s,'deep-think',m,e);s=applyMove(s,'code-execution',m,e);
    expect(s.stageIndex).toBe(1);expect(s.progress[1]).toBeLessThan(s.goals[1]);
    expect(s.events.some(x=>x.message.includes('Regression'))).toBe(true);
  });
});