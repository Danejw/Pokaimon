import { describe, expect, it } from 'vitest';
import { applyMove, createBattle, switchModel } from '../src/battle/engine';
import { INITIAL_MODEL, MODELS, TASK } from '../src/content/core';

describe('battle squad switching', () => {
  it('uses one turn and zero AP, while preserving stage progress and tracking the active companion', () => {
    const initial = createBattle(TASK, INITIAL_MODEL);
    const afterMove = applyMove(initial, 'deep-think', INITIAL_MODEL, TASK);
    const switched = switchModel(afterMove, 'grok', TASK, MODELS);
    expect(switched.modelId).toBe('grok');
    expect(switched.turn).toBe(afterMove.turn + 1);
    expect(switched.ap).toBe(afterMove.ap);
    expect(switched.progress).toEqual(afterMove.progress);
    expect(switched.events.filter(event => event.kind === 'MODEL_SWITCHED')).toHaveLength(1);
    expect(switched.events.find(event => event.kind === 'MODEL_SWITCHED')?.message).toContain('Grok 4.7');
    expect(switched.goals[1]).toBe(TASK.stages[1].goal + 14);
    expect(switched.events.filter(event => event.kind === 'ENEMY_ACTED' && event.message.includes(' used '))).toHaveLength(1);
  });
  it('rejects invalid, same, and disallowed switches without mutating state', () => {
    const initial = createBattle(TASK, INITIAL_MODEL);
    expect(switchModel(initial, 'astra', TASK, MODELS)).toBe(initial);
    expect(switchModel(initial, 'missing', TASK, MODELS)).toBe(initial);
    expect(switchModel({...initial, squadIds:['astra']}, 'grok', TASK, MODELS)).toEqual({...initial, squadIds:['astra']});
    expect(switchModel({...initial, outcome:'lost'}, 'grok', TASK, MODELS)).toEqual({...initial, outcome:'lost'});
  });
  it('validates equipped moves against the switched-in companion', () => {
    const initial = createBattle(TASK, INITIAL_MODEL);
    const next = switchModel(initial, 'grok', TASK, MODELS);
    expect(applyMove(next, 'deep-think', INITIAL_MODEL, TASK)).toBe(next);
    expect(applyMove(next, 'deep-think', MODELS[1], TASK)).toBe(next);
    expect(applyMove(next, 'max-reasoning', MODELS[1], TASK).turn).toBe(2);
  });
  it('can win with strategic switching without making the original solo path impossible', () => {
    let state = createBattle(TASK, INITIAL_MODEL);
    state = applyMove(state, 'deep-think', INITIAL_MODEL, TASK);
    state = switchModel(state, 'grok', TASK, MODELS);
    state = applyMove(state, 'code-review', MODELS[1], TASK);
    state = applyMove(state, 'code-review', MODELS[1], TASK);
    state = switchModel(state, 'astra', TASK, MODELS);
    state = applyMove(state, 'self-correction', INITIAL_MODEL, TASK);
    state = applyMove(state, 'self-correction', INITIAL_MODEL, TASK);
    expect(state.outcome).toBe('won');
    expect(state.turn).toBeLessThanOrEqual(8);
    const solo = ['deep-think','code-execution','self-correction','self-correction']
      .reduce((s,id) => applyMove(s,id,INITIAL_MODEL,TASK),createBattle(TASK,INITIAL_MODEL));
    expect(solo.outcome).toBe('won');
  });
});
