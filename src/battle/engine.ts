import type { BattleState, BattleEvent, EncounterDefinition, ModelDefinition, MoveDefinition } from './types';
import { MOVES, INITIAL_MODEL, MODELS, TASK } from '../content/core';

const TURN_LIMIT = 8;
const AP_LIMIT = 6;
function addEvent(events: BattleEvent[], turn: number, kind: BattleEvent['kind'], message: string, amount?: number): void {
  events.push({ seq: events.length, turn, kind, message, ...(amount === undefined ? {} : { amount }) });
}
export function createBattle(encounter: EncounterDefinition = TASK, model: ModelDefinition = INITIAL_MODEL, seed = 1, squad: readonly ModelDefinition[] = MODELS): BattleState {
  return {
    encounterId: encounter.id, modelId: model.id, squadIds: [...new Set([model.id, ...squad.map(companion => companion.id)])], seed, turn: 0, ap: AP_LIMIT, maxAp: AP_LIMIT,
    stageIndex: 0, guarded: false, lastMoveCategory: null, lastMoveTurn: -1,
    goals: encounter.stages.map(stage => stage.goal), progress: encounter.stages.map(() => 0),
    outcome: 'active', feedback: 'A wild ' + encounter.name + ' appeared! Choose a capability.',
    events: [{ seq: 0, turn: 0, kind: 'ENCOUNTER_STARTED', message: encounter.name + ' appeared!' },
      { seq: 1, turn: 0, kind: 'CHARACTER_SELECTED', message: model.displayName + ' entered battle.', modelId:model.id }],
  };
}
export function applyMove(
  state: BattleState, moveId: string,
  model: ModelDefinition = INITIAL_MODEL, encounter: EncounterDefinition = TASK,
  moves: Record<string,MoveDefinition> = MOVES,
): BattleState {
  if (state.outcome !== 'active' || state.modelId !== model.id || state.encounterId !== encounter.id) return state;
  const move = moves[moveId];
  if (!move || !model.moveIds.includes(moveId) || state.ap < move.cost || move.cost < 1) return state;
  const next: BattleState = {
    ...state, turn: state.turn + 1, ap: state.ap - move.cost, progress: [...state.progress], goals: [...state.goals], events: [...state.events],
  };
  const stage = encounter.stages[next.stageIndex];
  next.events.push({seq: next.events.length,turn:next.turn,kind:'MOVE_USED',
    message:model.displayName+' used '+move.name+'!',modelId:model.id,moveId});
  let feedback = '';
  const matches = stage.accepts.includes(move.category);
  const comboBonus = matches && move.category === 'verification' &&
    state.lastMoveCategory === 'research' && state.lastMoveTurn === state.turn
    ? 12 : 0;
  next.lastMoveCategory = matches ? move.category : null;
  next.lastMoveTurn = next.turn;
  if (!matches) {
    feedback = move.name + ' cannot advance ' + stage.label + '. ' + stage.hint;
    addEvent(next.events, next.turn, 'STAGE_PROGRESS_CHANGED', 'No progress. ' + stage.hint, 0);
  } else {
    const remaining = next.goals[next.stageIndex] - next.progress[next.stageIndex];
    const gain = Math.min(remaining, move.power + comboBonus);
    const appliedBonus = Math.max(0, gain - Math.min(remaining, move.power));
    if (appliedBonus > 0) addEvent(next.events, next.turn, 'COMBO_TRIGGERED',
      'Evidence verified! Research + Verification combo +' + appliedBonus + ' (simulated).', appliedBonus);
    if (move.tacticalEffect === 'guard' && next.turn <= 2) {
      next.guarded = true;
      addEvent(next.events, next.turn, 'STATUS_APPLIED', 'Code review raised a guard against the incoming counter.');
    }
    next.progress[next.stageIndex] += gain;
    feedback = move.name + ' advanced ' + stage.label + ' by ' + gain + '. ' + move.lesson +
      (appliedBonus ? ' Research + Verification combo!' : '');
    addEvent(next.events, next.turn, 'STAGE_PROGRESS_CHANGED', stage.label + ' +' + gain, gain);
    if (next.progress[next.stageIndex] >= next.goals[next.stageIndex]) {
      addEvent(next.events, next.turn, 'STAGE_COMPLETED', stage.label + ' complete!');
      next.stageIndex++;
      feedback = stage.label + ' complete! ' + move.lesson;
    }
  }
  if (next.stageIndex >= encounter.stages.length) {
    next.outcome = 'won';
    addEvent(next.events, next.turn, 'BATTLE_WON', encounter.name + ' completed!');
    next.feedback = feedback + ' ' + encounter.name + ' completed!';
    return next;
  }
  return finishTurn(next, encounter, feedback);
}

/** Resolve enemy effects after either a move or a switch. */
function finishTurn(next: BattleState, encounter: EncounterDefinition, initialFeedback: string): BattleState {
  let feedback = initialFeedback;
  if (next.turn === 2 && next.guarded) {
    next.guarded = false;
    addEvent(next.events, next.turn, 'STATUS_CONSUMED', 'Guard absorbed the enemy special.');
    addEvent(next.events, next.turn, 'ENEMY_ACTED', encounter.name + ' used ' + encounter.special + ', but your guard blocked it!');
    feedback += ' Guard blocked ' + encounter.special + '!';
  } else if (next.turn === 2) {
    const effect = encounter.specialEffect ?? 'scope-shift';
    if (effect === 'regression' && next.stageIndex > 0) {
      // A regression can reopen a recently completed stage.
      next.stageIndex--;
      next.progress[next.stageIndex] = Math.max(0, next.goals[next.stageIndex] - 16);
      addEvent(next.events, next.turn, 'ENEMY_ACTED', encounter.name + ' used Regression! Recheck the prior change.');
      feedback += ' Regression! Your previous stage needs another pass.';
    } else {
      const extra = effect === 'hidden-assumption' ? 12 : effect === 'false-lead' ? 18 : effect === 'source-conflict' ? 16 : 14;
      next.goals[next.stageIndex] += extra;
      addEvent(next.events, next.turn, 'ENEMY_ACTED', encounter.name + ' used ' + encounter.special + '! Extra verification is required.');
      feedback += ' ' + encounter.name + ' used ' + encounter.special + '!';
    }
  } else {
    addEvent(next.events, next.turn, 'ENEMY_ACTED', encounter.name + ' is watching your next move.');
  }
  if (next.guarded && next.turn > 2) {
    next.guarded = false;
    addEvent(next.events, next.turn, 'STATUS_CONSUMED', 'Guard expired.');
  }
  if (next.ap <= 0 || next.turn >= TURN_LIMIT) {
    next.outcome = 'lost';
    addEvent(next.events, next.turn, 'BATTLE_LOST', 'Out of action points! Try a different approach.');
    feedback += ' Out of action points! Try again.';
  }
  next.feedback = feedback;
  return next;
}

/** Switching is a tactical action: one turn, zero AP, and the usual enemy response. */
export function switchModel(
  state: BattleState, targetModelId: string,
  encounter: EncounterDefinition = TASK, roster: readonly ModelDefinition[] = MODELS,
): BattleState {
  if (state.outcome !== 'active' || state.encounterId !== encounter.id ||
      state.modelId === targetModelId || !state.squadIds.includes(targetModelId)) return state;
  const nextModel = roster.find(companion => companion.id === targetModelId);
  if (!nextModel) return state;
  const next: BattleState = { ...state, modelId: targetModelId,
    lastMoveCategory: null, lastMoveTurn: -1, turn: state.turn + 1,
    progress: [...state.progress], goals: [...state.goals], events: [...state.events] };
  next.events.push({seq:next.events.length,turn:next.turn,kind:'MODEL_SWITCHED',
    message:'Go! '+nextModel.displayName+'! One turn used, no AP spent.',modelId:nextModel.id});
  return finishTurn(next, encounter, nextModel.displayName + ' switched in.');
}

export function totalProgress(state: BattleState): number {
  const done = state.progress.reduce((n, value) => n + value, 0);
  const goal = state.goals.reduce((n, value) => n + value, 0);
  return goal ? Math.max(0, Math.min(100, Math.round(done / goal * 100))) : 0;
}
export function summarizeBattle(state: BattleState, encounter: EncounterDefinition = TASK): string {
  if (state.outcome === 'won') return 'Victory! ' + encounter.lesson;
  if (state.outcome === 'lost') return 'Defeat. The unfinished stage was ' + (encounter.stages[state.stageIndex]?.label ?? 'unknown') + '. Match your move to that stage and try again.';
  return encounter.stages[state.stageIndex]?.hint ?? '';
}