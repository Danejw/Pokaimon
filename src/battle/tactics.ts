import type { BattleState, EncounterDefinition, MoveDefinition } from './types';

/**
 * Deterministic on-screen intel for the game's simulated task battles.
 * This does not call an AI model and never changes the battle reducer.
 * It mirrors the reducer's category and capped-power progress rules.
 */
export interface MoveForecast {
  readonly status: 'effective' | 'mismatch' | 'unavailable';
  readonly gain: number;
  readonly finishesStage: boolean;
}

export function forecastMove(
  state: BattleState,
  move: MoveDefinition,
  encounter: EncounterDefinition,
): MoveForecast {
  const empty: MoveForecast = { status:'unavailable', gain:0, finishesStage:false };
  if (state.outcome !== 'active' || state.ap < move.cost || move.cost < 1 ||
      state.encounterId !== encounter.id) return empty;
  const stage = encounter.stages[state.stageIndex];
  if (!stage) return empty;
  if (!stage.accepts.includes(move.category)) {
    return { status:'mismatch', gain:0, finishesStage:false };
  }
  const remaining = Math.max(0, state.goals[state.stageIndex] - state.progress[state.stageIndex]);
  const comboBonus = move.category === 'verification' && state.lastMoveCategory === 'research' &&
    state.lastMoveTurn === state.turn ? 12 : 0;
  const gain = Math.min(remaining, move.power + comboBonus);
  return { status:'effective', gain, finishesStage:gain >= remaining };
}

export interface StageIntel {
  readonly label: string;
  readonly number: number;
  readonly count: number;
  readonly remaining: number;
  readonly accepted: readonly string[];
  readonly incomingSpecial: string | null;
}

export function getStageIntel(state: BattleState, encounter: EncounterDefinition): StageIntel {
  const stage = encounter.stages[state.stageIndex];
  if (!stage || state.outcome === 'won') {
    return { label:'All steps complete', number:encounter.stages.length,
      count:encounter.stages.length, remaining:0, accepted:[], incomingSpecial:null };
  }
  return {
    label:stage.label,
    number:state.stageIndex+1,
    count:encounter.stages.length,
    remaining:Math.max(0,state.goals[state.stageIndex]-state.progress[state.stageIndex]),
    accepted:stage.accepts,
    incomingSpecial:state.turn === 1 && state.outcome === 'active'
      ? encounter.special : null,
  };
}

/** An intentionally small reward for good simulated planning, not model rank. */
export function battleMedal(state: BattleState): 'TACTICAL CLEAR' | 'MISSION CLEAR' | null {
  if (state.outcome !== 'won') return null;
  const wasted = state.events.some(event =>
    event.kind === 'STAGE_PROGRESS_CHANGED' && event.amount === 0);
  return state.turn <= 4 && !wasted ? 'TACTICAL CLEAR' : 'MISSION CLEAR';
}
