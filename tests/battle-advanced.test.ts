import { describe, expect, it } from 'vitest';
import { applyMove, createBattle, switchModel } from '../src/battle/engine';
import { INITIAL_MODEL, MODELS, MOVES, TASK } from '../src/content/core';
import { RESEARCH } from '../src/content/encounters';

describe('battle evolution tactical interactions', () => {
  it('makes parallel search a fast expensive research option', () => {
    expect(MOVES['parallel-search'].cost).toBe(2);
    expect(MOVES['parallel-search'].power).toBeGreaterThan(MOVES['deep-research'].power);
    const grok=MODELS[1];
    const stage = applyMove(createBattle(RESEARCH,grok), 'max-reasoning', grok, RESEARCH);
    const used = applyMove(stage, 'parallel-search', grok, RESEARCH);
    expect(used.stageIndex).toBe(2);
    expect(used.ap).toBe(stage.ap - 2);
    const insufficient = {...stage,ap:1};
    expect(applyMove(insufficient,'parallel-search',grok,RESEARCH)).toBe(insufficient);
  });
  it('Code Review guards against the scripted second-turn special', () => {
    const grok=MODELS[1];
    let state = applyMove(createBattle(TASK,grok),'max-reasoning',grok,TASK);
    state = applyMove(state,'code-review',grok,TASK);
    expect(state.turn).toBe(2);
    expect(state.goals[2]).toBe(TASK.stages[2].goal);
    expect(state.events.some(event=>event.kind==='STATUS_CONSUMED')).toBe(true);
    expect(state.events.some(event=>event.kind==='ENEMY_ACTED' && event.message.includes('blocked'))).toBe(true);
    const unguarded=applyMove(applyMove(createBattle(TASK,INITIAL_MODEL),'deep-think',INITIAL_MODEL,TASK),'code-execution',INITIAL_MODEL,TASK);
    expect(unguarded.goals[2]).toBe(TASK.stages[2].goal+14);
  });
  it('Research then Verify completes a conflict with a once-only deterministic combo', () => {
    let state=applyMove(createBattle(RESEARCH,INITIAL_MODEL),'deep-think',INITIAL_MODEL,RESEARCH);
    state=applyMove(state,'deep-research',INITIAL_MODEL,RESEARCH);
    expect(state.stageIndex).toBe(2);
    state=applyMove(state,'self-correction',INITIAL_MODEL,RESEARCH);
    expect(state.outcome).toBe('won');
    expect(state.events.filter(e=>e.kind==='COMBO_TRIGGERED')).toHaveLength(1);
    const combo=state.events.find(e=>e.kind==='COMBO_TRIGGERED');
    expect(combo?.amount).toBe(12);
    expect(state.progress[2]).toBe(state.goals[2]);
  });
  it('switching interrupts a research to verification combo', () => {
    const initial=applyMove(applyMove(createBattle(RESEARCH,INITIAL_MODEL),'deep-think',INITIAL_MODEL,RESEARCH),'deep-research',INITIAL_MODEL,RESEARCH);
    const switched=switchModel(initial,'fable',RESEARCH,MODELS);
    const next=applyMove(switched,'self-correction',MODELS[2],RESEARCH);
    expect(next.events.some(e=>e.kind==='COMBO_TRIGGERED')).toBe(false);
    expect(next.outcome).toBe('active');
  });
  it('replaying the same actions yields the same statuses, events, and result', () => {
    const go=()=>{
      let s=createBattle(TASK,MODELS[1]);
      s=applyMove(s,'max-reasoning',MODELS[1],TASK);
      s=applyMove(s,'code-review',MODELS[1],TASK);
      s=applyMove(s,'code-review',MODELS[1],TASK);
      return s;
    };
    expect(go()).toEqual(go());
  });
});
