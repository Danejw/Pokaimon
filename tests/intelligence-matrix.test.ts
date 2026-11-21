import {describe,expect,it} from 'vitest';
import {applyMove,createBattle,inspectScenarioClue} from '../src/battle/engine';
import {HYDRA,GOLEM,SCOPE,INTELLIGENCE_CLUES} from '../src/content/intelligentEncounters';
import {MODELS,MOVES} from '../src/content/core';
import type {EncounterDefinition,ModelDefinition,Capability} from '../src/battle/types';

const astra=MODELS.find(model=>model.id==='astra')!;
const opus=MODELS.find(model=>model.id==='opus55')!;
const bosses=[HYDRA,GOLEM,SCOPE] as const;
const seeds=[3,601,987654] as const;

function technique(model:ModelDefinition,category:Capability):string {
  const id=model.moveIds.find(id=>MOVES[id].category===category);
  if(!id)throw Error(model.id+' lacks '+category);
  return id;
}
function solve(encounter:EncounterDefinition,model:ModelDefinition,seed:number,inspect:boolean) {
  const squad=model.id==='astra'?[astra,opus]:[opus,astra];
  let state=createBattle(encounter,model,seed,squad);
  if(inspect){
    const clueId=encounter.mechanic==='hydra'?INTELLIGENCE_CLUES.hydra.id:
      encounter.mechanic==='golem'?INTELLIGENCE_CLUES.golem.id:INTELLIGENCE_CLUES.scope.id;
    state=inspectScenarioClue(state,clueId,encounter);
  }
  const categories:Capability[]=encounter.mechanic==='hydra'?
    ['reasoning','research','verification']:['reasoning','coding','verification'];
  for(const category of categories)state=applyMove(state,technique(model,category),model,encounter);
  if(!inspect)state=applyMove(state,technique(model,'verification'),model,encounter);
  return state;
}
describe('Phase 6 encounter solvability matrix',()=>{
  for(const boss of bosses){
    for(const model of [astra,opus]){
      it(boss.name+' remains winnable via both tactics using '+model.displayName+' across seeds',()=>{
        for(const seed of seeds){
          const cautious=solve(boss,model,seed,true);
          const rushed=solve(boss,model,seed,false);
          expect(cautious.outcome,boss.id+' cautious seed '+seed).toBe('won');
          expect(rushed.outcome,boss.id+' rushed seed '+seed).toBe('won');
          expect(cautious.ap).toBeGreaterThan(rushed.ap);
          expect(cautious.turn).toBeLessThanOrEqual(cautious.maxTurns);
          expect(rushed.turn).toBeLessThanOrEqual(rushed.maxTurns);
          expect(cautious.events.some(event=>event.kind==='CLUE_FOUND')).toBe(true);
          expect(rushed.events.some(event=>event.kind==='CLUE_FOUND')).toBe(false);
        }
      });
    }
    it(boss.name+' supports genuine defeat after repeated ineffective actions',()=>{
      let state=createBattle(boss,astra,5,[astra,opus]);
      while(state.outcome==='active')state=applyMove(state,'deep-think',astra,boss);
      expect(state.outcome).toBe('lost');
      expect(state.turn).toBeLessThanOrEqual(state.maxTurns);
    });
  }
});