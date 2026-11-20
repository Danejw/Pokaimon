import { describe, expect, it } from 'vitest';
import { ENCOUNTERS } from '../src/content/encounters';
import { pickWildEncounter, phaseAfter, animationDuration } from '../src/game/encounterFlow';

describe('authentic wild encounter flow', () => {
  it('chooses freely from every wild problem, without campaign unlock gates', () => {
    expect(pickWildEncounter(ENCOUNTERS, () => 0)).toBe(ENCOUNTERS[0]);
    expect(pickWildEncounter(ENCOUNTERS, () => 0.999999)).toBe(ENCOUNTERS.at(-1));
    const picks = new Set(Array.from({ length: 5 }, (_, i) => pickWildEncounter(ENCOUNTERS, () => i / 5).id));
    expect(picks.size).toBe(5);
  });
  it('supports a direct encounter link for reproducible testing and sharing', () => {
    expect(pickWildEncounter(ENCOUNTERS, () => 0.9, 'task').id).toBe('task');
    expect(pickWildEncounter(ENCOUNTERS, () => 0.9, 'unknown').id).toBe('hallucination');
  });
  it('enforces encounter, selection, throw, summon, command sequence', () => {
    expect(phaseAfter('encounter')).toBe('selection');
    expect(phaseAfter('selection')).toBeNull(); // player picks the model
    expect(phaseAfter('throw')).toBe('summon');
    expect(phaseAfter('summon')).toBe('command');
    expect(phaseAfter('attack')).toBe('command'); // the reducer can override to result
  });
  it('reduced motion shortens presentation only, not the turn rules', () => {
    expect(animationDuration('throw', true)).toBeLessThan(animationDuration('throw', false));
    expect(animationDuration('attack', true)).toBeLessThan(animationDuration('attack', false));
  });
});
