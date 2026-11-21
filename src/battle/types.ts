export type Capability = 'reasoning' | 'research' | 'coding' | 'verification' | 'context';
export type Outcome = 'active' | 'won' | 'lost';

export interface MoveDefinition {
  id: string; name: string; category: Capability; power: number; cost: number;
  description: string; lesson: string; animation: string; toolRequired?: string; tacticalEffect?: 'guard';
}
export interface ModelDefinition {
  id: string; provider: string; displayName: string; version: string;
  description: string; source: string; verifiedAt: string; moveIds: readonly [string,string,string,string];
  palette: string; focus: number; tempo: number; precision: number;
  passiveId?: 'analysis-boost'|'audit-ward'|'verification-link';
}
export interface StageDefinition {
  id: string; label: string; goal: number; accepts: readonly Capability[];
  hint: string;
}
export interface EncounterDefinition {
  id: string; name: string; level: number; description: string; category: string;
  stages: readonly StageDefinition[]; lesson: string; special: string; specialEffect?: 'scope-shift' | 'regression' | 'source-conflict' | 'hidden-assumption' | 'false-lead';
  mechanic?: 'hydra' | 'golem' | 'scope';
  budget?: {ap:number;turns:number};
  rival?: {name:string;repeatPenalty:number};
  boss?: {label:string;phaseAt:number;effect:'audit'|'reopen'|'drain';amount:number};
}
export type EventKind = 'ENCOUNTER_STARTED' | 'CHARACTER_SELECTED' | 'MOVE_USED' | 'STAGE_PROGRESS_CHANGED' | 'STAGE_COMPLETED' | 'ENEMY_ACTED' | 'BATTLE_WON' | 'BATTLE_LOST' | 'MODEL_SWITCHED' | 'STATUS_APPLIED' | 'STATUS_CONSUMED' | 'COMBO_TRIGGERED' | 'RIVAL_ACTED' | 'BOSS_PHASE_CHANGED' | 'CLUE_FOUND' | 'APPROACH_CHANGED';
export interface BattleEvent { seq: number; turn: number; kind: EventKind; message: string; amount?: number; moveId?: string; modelId?: string; clueId?: string; }
export interface BattleState {
  encounterId: string; modelId: string; squadIds: string[]; seed: number; turn: number; ap: number; maxAp: number; maxTurns: number;
  progress: number[]; goals: number[]; stageIndex: number; outcome: Outcome;
  guarded: boolean; lastMoveCategory: Capability | null; lastMoveTurn: number; bossPhaseTriggered:boolean;
  hydra?: { clueKnown: boolean; falseConfidence: number };
  tactic?: { inspected:boolean; consequence:boolean; recovered:boolean };
  feedback: string; events: BattleEvent[];
}