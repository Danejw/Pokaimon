import type { ModelDefinition } from '../battle/types';
import type { Progress } from '../storage/progress';
import { MODELS, MOVES } from './core';
import { ENCOUNTERS } from './encounters';

/** A faction's game stats and loadouts never imply empirical model rankings. */
export function rosterForProgress(progress: Progress): ModelDefinition[] {
  return MODELS.map(model => model.id === 'astra' && progress.useAlternateLoadout
    ? {...model, moveIds: ['deep-think','deep-research','code-review','self-correction'] as const}
    : model);
}

/** Every random wild encounter must remain solvable by the selected squad. */
export function teamCanHandleEncounters(team: readonly ModelDefinition[]): boolean {
  return team.length > 0 && ENCOUNTERS.every(encounter =>
    encounter.stages.every(stage => team.some(model =>
      model.moveIds.some(id => {
        const move = MOVES[id];
        return !!move && stage.accepts.includes(move.category);
      })
    ))
  );
}
