import { describe, expect, it } from 'vitest';
import { applyMove, createBattle, switchModel } from '../src/battle/engine';
import { MODELS } from '../src/content/core';
import { ENCOUNTERS } from '../src/content/encounters';
import type { BattleState, EncounterDefinition, ModelDefinition } from '../src/battle/types';

// Bounded reachability audit, not a claim about live AI performance.
function winExists(encounter: EncounterDefinition, starter: ModelDefinition): boolean {
  let frontier: BattleState[] = [createBattle(encounter, starter)];
  const seen = new Set<string>();
  for (let depth=0; depth < 8 && frontier.length; depth++) {
    const next: BattleState[] = [];
    for (const state of frontier) {
      const active = MODELS.find(m => m.id === state.modelId)!;
      const trials = [
        ...active.moveIds.map(id => applyMove(state, id, active, encounter)),
        ...MODELS.filter(m => m.id !== active.id).map(m => switchModel(state, m.id, encounter, MODELS)),
      ];
      for (const s of trials) {
        if (s.outcome === 'won') return true;
        if (s.outcome !== 'active' || s === state) continue;
        const key = [s.modelId,s.turn,s.ap,s.stageIndex,s.guarded,s.lastMoveCategory,s.lastMoveTurn,
          ...s.progress,...s.goals].join('|');
        if (!seen.has(key)) { seen.add(key); next.push(s); }
      }
    }
    frontier = next;
  }
  return false;
}

describe('Phase 1 reachable strategy matrix', () => {
  it('every starter team can finish each of five simulated encounters', () => {
    for (const encounter of ENCOUNTERS) {
      for (const starter of MODELS) {
        expect(winExists(encounter,starter), encounter.id+' / '+starter.id).toBe(true);
      }
    }
  });
  it('switching and enemy counters are deterministic across identical seeds', () => {
    for (const encounter of ENCOUNTERS) {
      for (const starter of MODELS) {
        const go = () => {
          let state = createBattle(encounter,starter,7);
          state = applyMove(state,starter.moveIds[0],starter,encounter);
          state = switchModel(state,MODELS.find(m => m.id !== starter.id)!.id,encounter,MODELS);
          return state;
        };
        expect(go()).toEqual(go());
      }
    }
  });
});
