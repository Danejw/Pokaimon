import type { BattleState } from '../battle/types';
import type { ModifierId } from './variants';

export type ChallengeObjective = 'speed' | 'switch' | 'combo';
export type ChallengeTier = 'Standard' | 'Expert';
export interface ChallengeDefinition {
  readonly id:string;
  readonly title:string;
  readonly tagline:string;
  readonly encounterId:string;
  readonly seed:number;
  readonly modifierIds:readonly ModifierId[];
  readonly objective:ChallengeObjective;
  readonly tier:ChallengeTier;
  readonly maxTurns?:number;
}

export const CHALLENGES:readonly ChallengeDefinition[]=[
  {id:'audit-task',title:'Precision Audit',tagline:'Finish a task despite an expanded final audit in five turns or fewer.',
    encounterId:'task',seed:101,modifierIds:['extra-audit'],objective:'speed',tier:'Standard',maxTurns:5},
  {id:'relay-bug',title:'Relay Repair',tagline:'Defeat BUG while switching to a second companion at least once.',
    encounterId:'bug',seed:202,modifierIds:['tight-budget'],objective:'switch',tier:'Expert'},
  {id:'source-check',title:'Evidence Chain',tagline:'Finish a research encounter using a real Research → Verification combo.',
    encounterId:'research',seed:103,modifierIds:['counter-rotation'],objective:'combo',tier:'Standard'},
];
export function getChallenge(id:string):ChallengeDefinition|undefined{
  return CHALLENGES.find(challenge=>challenge.id===id);
}
export function evaluateChallenge(challenge:ChallengeDefinition,state:BattleState):boolean{
  if(state.outcome!=='won'||state.encounterId!==challenge.encounterId||state.seed!==challenge.seed)
    return false;
  if(challenge.objective==='speed')return state.turn<=(challenge.maxTurns??8);
  if(challenge.objective==='switch')return state.events.some(e=>e.kind==='MODEL_SWITCHED');
  return state.events.some(e=>e.kind==='COMBO_TRIGGERED');
}
