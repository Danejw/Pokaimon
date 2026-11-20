import type { EncounterDefinition } from '../battle/types';

export type BattlePhase = 'encounter' | 'selection' | 'throw' | 'summon' | 'command' | 'attack' | 'result';

/** Wild encounters are available without a menu or unlock requirements. */
export function pickWildEncounter(
  encounters: readonly EncounterDefinition[],
  random: () => number = Math.random,
  override?: string | null,
): EncounterDefinition {
  if (!encounters.length) throw new Error('No wild encounters configured');
  const specified = override ? encounters.find(e => e.id === override) : undefined;
  if (specified) return specified;
  const roll = random();
  const index = Math.min(encounters.length - 1, Math.max(0, Math.floor(
    (Number.isFinite(roll) ? roll : 0) * encounters.length,
  )));
  return encounters[index];
}

/** States that advance automatically. Selection and command wait for a real human input. */
export function phaseAfter(phase: BattlePhase): BattlePhase | null {
  switch (phase) {
    case 'encounter': return 'selection';
    case 'throw': return 'summon';
    case 'summon': return 'command';
    case 'attack': return 'command';
    default: return null;
  }
}

export function animationDuration(phase: BattlePhase, reducedMotion: boolean): number {
  if (reducedMotion) return 70;
  switch (phase) {
    case 'encounter': return 1450;
    case 'throw': return 620;
    case 'summon': return 920;
    case 'attack': return 780;
    default: return 0;
  }
}
