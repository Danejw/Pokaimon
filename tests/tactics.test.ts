import { describe, expect, it } from 'vitest';
import { applyMove, createBattle } from '../src/battle/engine';
import { forecastMove, getStageIntel, battleMedal } from '../src/battle/tactics';
import { INITIAL_MODEL, MOVES, TASK } from '../src/content/core';

describe('battle tactics as readable game feedback', () => {
  it('forecasts the exact accepted progress without changing game state', () => {
    const state = createBattle();
    const snapshot = JSON.stringify(state);
    expect(forecastMove(state, MOVES['deep-think'], TASK)).toEqual({
      status:'effective', gain:36, finishesStage:true,
    });
    expect(forecastMove(state, MOVES['code-execution'], TASK)).toEqual({
      status:'mismatch', gain:0, finishesStage:false,
    });
    expect(JSON.stringify(state)).toBe(snapshot);
    const next = applyMove(state,'deep-think');
    expect(next.progress[0] - state.progress[0]).toBe(36);
  });
  it('works after a stage changes and the enemy scope shift occurs', () => {
    const s0 = createBattle();
    const s1 = applyMove(s0,'deep-think');
    expect(getStageIntel(s1,TASK).label).toBe('Apply a solution');
    expect(forecastMove(s1,MOVES['code-execution'],TASK).gain).toBe(36);
    const s2 = applyMove(s1,'code-execution');
    expect(s2.goals[2]).toBe(50);
    expect(forecastMove(s2,MOVES['self-correction'],TASK)).toEqual({
      status:'effective', gain:40, finishesStage:false,
    });
  });
  it('labels depleted AP and ended encounters without implying live AI execution', () => {
    const zero = {...createBattle(), ap:0};
    expect(forecastMove(zero,MOVES['deep-think'],TASK).status).toBe('unavailable');
    const won = ['deep-think','code-execution','self-correction','self-correction'].reduce(
      (s,id)=>applyMove(s,id,INITIAL_MODEL,TASK),createBattle());
    expect(forecastMove(won,MOVES['deep-think'],TASK).status).toBe('unavailable');
    expect(battleMedal(won)).toMatch(/CLEAR/);
    expect(getStageIntel(won,TASK).label).toBe('All steps complete');
  });
  it('uses an explicit medal based on saved simulated move events', () => {
    const s0=createBattle();
    const s1=applyMove(s0,'deep-think');
    const s2=applyMove(s1,'deep-think'); // ineffective waste
    const s3=applyMove(s2,'code-execution');
    const s4=applyMove(s3,'code-execution');
    const s5=applyMove(s4,'self-correction');
    const s6=applyMove(s5,'self-correction');
    expect(s6.outcome).toBe('won');
    expect(battleMedal(s6)).toBe('MISSION CLEAR');
    const fast=['deep-think','code-execution','self-correction','self-correction'].reduce(
      (s,id)=>applyMove(s,id),createBattle());
    expect(battleMedal(fast)).toBe('TACTICAL CLEAR');
    expect(battleMedal(createBattle())).toBeNull();
  });
});
