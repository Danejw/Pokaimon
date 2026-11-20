import { describe, expect, it } from 'vitest';
import { applyMove, createBattle, totalProgress } from '../src/battle/engine';
import { INITIAL_MODEL, TASK } from '../src/content/core';

function run(...moves: string[]) { return moves.reduce((state,id) => applyMove(state,id),createBattle()); }

describe('TASK battle reducer', () => {
  it('starts a simulated three-stage encounter', () => {
    const s=createBattle();expect(s.outcome).toBe('active');expect(s.stageIndex).toBe(0);
    expect(s.ap).toBe(6);expect(s.progress).toEqual([0,0,0]);expect(totalProgress(s)).toBe(0);
  });
  it('is deterministic for the same seed and sequence', () => {
    const a=run('deep-think','code-execution','self-correction','self-correction');
    const b=run('deep-think','code-execution','self-correction','self-correction');
    expect(a).toEqual(b); expect(a.outcome).toBe('won'); expect(totalProgress(a)).toBe(100);
  });
  it('requires the right category for each stage', () => {
    const planning=run('deep-think');
    expect(planning.stageIndex).toBe(1);
    const stillExecuting=applyMove(planning,'deep-think');
    expect(stillExecuting.stageIndex).toBe(1);
    expect(stillExecuting.progress[1]).toBe(0);
    expect(stillExecuting.ap).toBe(4);
  });
  it('turn-two scope shift increases required work once', () => {
    const s=run('deep-think','code-execution');
    expect(s.stageIndex).toBe(2);expect(s.goals[2]).toBe(TASK.stages[2].goal+14);
    expect(s.events.filter(e=>e.kind==='ENEMY_ACTED')).toHaveLength(2);
  });
  it('loses with repeated ineffective actions', () => {
    const s=run(...Array(6).fill('deep-research'));
    expect(s.outcome).toBe('lost');expect(s.stageIndex).toBe(1);expect(s.ap).toBe(0);
  });
  it('rejects unknown or unequipped moves without any mutation', () => {
    const s=createBattle();
    expect(applyMove(s,'not-a-move')).toBe(s);
    expect(applyMove(s,'code-review')).toBe(s);
    expect(applyMove({...s,ap:0},'deep-think')).toEqual({...s,ap:0});
    expect(applyMove({...s,modelId:'not-astra'},'deep-think',INITIAL_MODEL,TASK)).toEqual({...s,modelId:'not-astra'});
  });
  it('cannot continue after victory', () => {
    const win=run('deep-think','code-execution','self-correction','self-correction');
    expect(applyMove(win,'deep-think')).toBe(win);
  });
});