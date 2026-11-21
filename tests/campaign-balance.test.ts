import { describe, expect, it } from 'vitest';
import { applyMove, createBattle, switchModel } from '../src/battle/engine';
import { INITIAL_MODEL, MODELS } from '../src/content/core';
import { CAMPAIGN_MISSIONS } from '../src/content/campaign';
import type { BattleState, EncounterDefinition, ModelDefinition } from '../src/battle/types';

function findWin(encounter:EncounterDefinition, starter:ModelDefinition, team:readonly ModelDefinition[]) {
  let states:BattleState[]=[createBattle(encounter,starter,5,team)];
  const seen=new Set<string>();
  for(let depth=0;depth<8;depth++){
    const next:BattleState[]=[];
    for(const state of states){
      const model=team.find(m=>m.id===state.modelId)!;
      const options=[
        ...model.moveIds.map(id=>applyMove(state,id,model,encounter)),
        ...team.filter(m=>m.id!==model.id).map(m=>switchModel(state,m.id,encounter,team)),
      ];
      for(const trial of options){
        if(trial.outcome==='won')return trial;
        if(trial.outcome!=='active'||trial===state)continue;
        const key=[trial.modelId,trial.turn,trial.ap,trial.stageIndex,trial.guarded,
          trial.bossPhaseTriggered,trial.lastMoveCategory,trial.lastMoveTurn,
          ...trial.progress,...trial.goals].join('|');
        if(!seen.has(key)){seen.add(key);next.push(trial);}
      }
    }
    states=next;
  }
  return null;
}

describe('authored campaign balance',()=>{
  it('every mission is beatable by the existing starting Astra companion',()=>{
    for(const mission of CAMPAIGN_MISSIONS){
      const win=findWin(mission.encounter,INITIAL_MODEL,[INITIAL_MODEL]);
      expect(win,mission.id).not.toBeNull();
      if(mission.kind==='boss')
        expect(win!.events.filter(event=>event.kind==='BOSS_PHASE_CHANGED'),mission.id).toHaveLength(1);
    }
  });
  it('every starting model has a valid squad route through all nine missions',()=>{
    for(const mission of CAMPAIGN_MISSIONS)
      for(const starter of MODELS)
        expect(findWin(mission.encounter,starter,MODELS),mission.id+' / '+starter.id).not.toBeNull();
  });
});
