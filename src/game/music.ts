/**
 * Eight-bar original handheld battle loop. Pulse melody, counter-pulse arpeggio,
 * triangle bass, and filtered noise percussion, mixed through one AudioContext.
 * The composition and sound synthesis are created specifically for Pokaimon.
 */
import { getAudioEngine, playNoise, playTone, setMusicActive } from './audioEngine';

let timer: number | null = null;
let nextTime = 0;
let step = 0;
const STEP_SECONDS = 0.1375; // 109 BPM, sixteenth-note grid
const bassRoots = [40, 36, 43, 38, 40, 36, 45, 47] as const; // E C G D E C A B
const phrases: readonly (readonly (number | null)[])[] = [
  [76, null, 79, 83, 81, null, 79, 76, 74, null, 76, 79, 81, null, 79, null],
  [76, null, 79, 81, 83, 81, 79, null, 76, null, 74, 72, 74, null, 76, null],
  [79, null, 83, 86, 83, null, 81, 79, 76, null, 79, 81, 79, null, 76, null],
  [74, null, 76, 79, 81, null, 79, 76, 74, null, 71, 74, 76, 79, 81, null],
  [83, null, 81, 79, 76, 79, 81, null, 83, 86, 83, 81, 79, null, 76, null],
  [79, null, 76, 72, 76, null, 79, null, 81, 79, 76, 74, 76, null, 79, null],
  [81, null, 84, 88, 86, null, 84, 81, 79, null, 81, 84, 83, null, 81, null],
  [83, null, 81, 79, 78, null, 81, 83, 86, 83, 81, 78, 76, null, null, null],
];
const arpeggio = [0, 7, 12, 7, 3, 7, 12, 7] as const;

function schedule(): void {
  const audio = getAudioEngine();
  if (!audio || !audio.musicActive || audio.ctx.state !== 'running') return;
  const { ctx } = audio;
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.025;
  while (nextTime < ctx.currentTime + 0.16) {
    const position = step % 16;
    const bar = Math.floor(step / 16) % phrases.length;
    const root = bassRoots[bar];
    const pitch = phrases[bar][position];
    if (pitch !== null) {
      playTone(audio, 'music', pitch, nextTime, position % 4 === 0 ? 0.19 : 0.11, 0.085, 'square');
    }
    if (position % 4 === 0) {
      playTone(audio, 'music', root, nextTime, 0.36, 0.13, 'triangle');
    }
    if (position % 2 === 0) {
      const chordNote = root + 12 + arpeggio[(position / 2) % arpeggio.length];
      playTone(audio, 'music', chordNote, nextTime, 0.10, 0.024, 'square');
      playNoise(audio, 'music', nextTime, 0.025, 0.028, 3400);
    }
    if (position === 0 || position === 7 || position === 10) {
      playNoise(audio, 'music', nextTime, 0.085, 0.065, 280, 'lowpass');
    }
    if (position === 4 || position === 12) {
      playNoise(audio, 'music', nextTime, 0.065, 0.057, 1250);
    }
    step++;
    nextTime += STEP_SECONDS;
  }
}

/** Starts on PLAY or retry; silence on HOME, mute or results. */
export function setBattleMusic(shouldPlay: boolean, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (!shouldPlay || !enabled) {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    setMusicActive(false);
    return;
  }
  if (timer !== null) return;
  const audio = getAudioEngine();
  if (!audio) return;
  setMusicActive(true);
  step = 0;
  nextTime = audio.ctx.currentTime + 0.04;
  schedule();
  timer = window.setInterval(schedule, 65);
}
