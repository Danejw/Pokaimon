/**
 * Original handheld sound effects. Reuses the music AudioContext and has
 * recognizable timbres for each AI capability rather than generic beeps.
 */
import { duckMusic, getAudioEngine, playNoise, playTone } from './audioEngine';

export type Cue = 'select' | 'confirm' | 'encounter' | 'throw' | 'summon'
  | 'attack' | 'hit' | 'win' | 'lose' | 'text' | 'combo' | 'boss-phase';
let lastTextAt = -Infinity;

export function playCue(kind: Cue, enabled: boolean, category = ''): void {
  if (!enabled) return;
  const audio = getAudioEngine();
  if (!audio) return;
  const t = audio.ctx.currentTime + 0.005;
  if (kind === 'text') {
    // Throttle dialogue ticks: audible texture without a constant shrill stream.
    if (t - lastTextAt < 0.105) return;
    lastTextAt = t;
    playTone(audio, 'effects', 82, t, 0.017, 0.012, 'square');
    return;
  }

  if (['encounter', 'throw', 'summon', 'attack', 'win', 'lose'].includes(kind)) {
    duckMusic(audio, kind === 'win' ? 0.9 : 0.32);
  }

  switch (kind) {
    case 'select':
      playTone(audio, 'effects', 74, t, 0.045, 0.065, 'square');
      break;
    case 'confirm':
      playTone(audio, 'effects', 76, t, 0.065, 0.08);
      playTone(audio, 'effects', 83, t + 0.065, 0.095, 0.09);
      break;
    case 'encounter':
      playTone(audio, 'effects', 64, t, 0.12, 0.11, 'sawtooth', -4);
      playTone(audio, 'effects', 71, t + 0.105, 0.11, 0.095, 'square');
      playTone(audio, 'effects', 76, t + 0.21, 0.24, 0.10, 'square');
      playNoise(audio, 'effects', t, 0.12, 0.065, 2200);
      break;
    case 'throw':
      playNoise(audio, 'effects', t, 0.18, 0.09, 1900);
      [67, 71, 74, 79].forEach((n, i) =>
        playTone(audio, 'effects', n, t + i * 0.05, 0.095, 0.095, 'square'));
      break;
    case 'summon':
      [72, 76, 79, 84].forEach((n, i) =>
        playTone(audio, 'effects', n, t + i * 0.085, 0.19, 0.08, 'triangle'));
      playTone(audio, 'effects', 88, t + 0.34, 0.25, 0.055, 'square');
      break;
    case 'attack': {
      // The attack's audible identity follows the deterministic move category.
      const pattern: Record<string, number[]> = {
        reasoning: [64, 71, 76, 83],
        research: [79, 83, 86, 91],
        coding: [55, 59, 62, 67],
        verification: [72, 79, 84, 88],
        context: [76, 72, 79, 74],
      };
      const notes = pattern[category] ?? [60, 67, 72];
      const wave: OscillatorType = category === 'coding' ? 'sawtooth'
        : category === 'verification' ? 'triangle' : 'square';
      notes.forEach((n, i) => {
        const offset = i * (category === 'research' ? 0.048 : 0.065);
        playTone(audio, 'effects', n, t + offset, 0.10, 0.105, wave,
          category === 'coding' ? -2 : category === 'reasoning' ? 3 : 0);
      });
      if (category === 'coding' || category === 'context') {
        playNoise(audio, 'effects', t + 0.06, 0.11, 0.085, 1400);
      }
      break;
    }
    case 'combo':
      [77,81,84,89].forEach((n,i)=>playTone(audio,'effects',n,t+i*0.055,0.13,0.065,'triangle'));
      break;
    case 'boss-phase':
      playNoise(audio,'effects',t,0.20,0.10,720,'lowpass');
      [49,52,56].forEach((n,i)=>playTone(audio,'effects',n,t+i*0.09,0.19,0.09,'sawtooth'));
      break;
    case 'hit':
      playNoise(audio, 'effects', t, 0.095, 0.13, 870, 'lowpass');
      playTone(audio, 'effects', category === 'verification' ? 66 : 55,
        t, 0.16, 0.12, 'sawtooth', -15);
      break;
    case 'win':
      [64, 67, 71, 76, 71, 76, 83].forEach((n, i) =>
        playTone(audio, 'effects', n, t + i * 0.12, i === 6 ? 0.55 : 0.18,
          i === 6 ? 0.12 : 0.10, 'square'));
      playTone(audio, 'effects', 71, t + 0.72, 0.60, 0.063, 'triangle');
      break;
    case 'lose':
      [69, 65, 62, 57].forEach((n, i) =>
        playTone(audio, 'effects', n, t + i * 0.16, i === 3 ? 0.42 : 0.20, 0.078, 'triangle'));
      break;
  }
}
