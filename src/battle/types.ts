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
}
export interface StageDefinition {
  id: string; label: string; goal: number; accepts: readonly Capability[];
  hint: string;
}
export interface EncounterDefinition {
  id: string; name: string; level: number; description: string; category: string;
  stages: readonly StageDefinition[]; lesson: string; special: string; specialEffect?: 'scope-shift' | 'regression' | 'source-conflict' | 'hidden-assumption' | 'false-lead';
}
export type EventKind = 'ENCOUNTER_STARTED' | 'CHARACTER_SELECTED' | 'MOVE_USED' | 'STAGE_PROGRESS_CHANGED' | 'STAGE_COMPLETED' | 'ENEMY_ACTED' | 'BATTLE_WON' | 'BATTLE_LOST' | 'MODEL_SWITCHED' | 'STATUS_APPLIED' | 'STATUS_CONSUMED' | 'COMBO_TRIGGERED';
export interface BattleEvent { seq: number; turn: number; kind: EventKind; message: string; amount?: number; moveId?: string; modelId?: string; }
export interface BattleState {
  encounterId: string; modelId: string; squadIds: string[]; seed: number; turn: number; ap: number; maxAp: number;
  progress: number[]; goals: number[]; stageIndex: number; outcome: Outcome;
  guarded: boolean; lastMoveCategory: Capability | null; lastMoveTurn: number;
  feedback: string; events: BattleEvent[];
}