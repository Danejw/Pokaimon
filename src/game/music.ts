/**
 * Original four-voice battle theme with the limited pulse, triangle and noise
 * palette of handheld sound chips. This is an original composition and does
 * not sample or transcribe any game soundtrack.
 */
let ctx: AudioContext | null = null;
let timer: number | null = null;
let nextTime = 0;
let step = 0;
const lead: readonly (number | null)[] = [
  76, null, 79, 83, 81, 79, 76, null,
  74, 76, 79, null, 81, null, 79, 74,
  72, null, 76, 79, 83, 81, 79, null,
  76, 74, 72, 74, 76, null, 79, null,
];
const low: readonly number[] = [48, 48, 55, 55, 53, 53, 55, 55];
const hz = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

function note(n: number, t: number, d: number, volume: number, wave: OscillatorType) {
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(hz(n), t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.007);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(t);
  oscillator.stop(t + d + 0.015);
}

function percussion(t: number, duration: number, volume: number) {
  if (!ctx) return;
  const frames = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0xace1;
  for (let i = 0; i < frames; i++) {
    seed = (seed >> 1) ^ (-(seed & 1) & 0xb400);
    data[i] = seed & 1 ? 0.5 : -0.5;
  }
  const source = ctx.createBufferSource();
  const highPass = ctx.createBiquadFilter();
  const volumeGain = ctx.createGain();
  highPass.type = 'highpass';
  highPass.frequency.value = 1400;
  volumeGain.gain.setValueAtTime(volume, t);
  volumeGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.buffer = buffer;
  source.connect(highPass);
  highPass.connect(volumeGain);
  volumeGain.connect(ctx.destination);
  source.start(t);
  source.stop(t + duration);
}

function schedule() {
  if (!ctx || ctx.state !== 'running') return;
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.02;
  while (nextTime < ctx.currentTime + 0.14) {
    const index = step % lead.length;
    const pitch = lead[index];
    if (pitch !== null) note(pitch, nextTime, 0.12, 0.014, 'square');
    if (index % 4 === 0) note(low[(index / 4) % low.length], nextTime, 0.28, 0.015, 'triangle');
    if (index % 4 === 2) percussion(nextTime, 0.035, 0.012);
    if (index % 2 === 1) percussion(nextTime, 0.012, 0.004);
    step++;
    nextTime += 0.16;
  }
}

/** Call from the PLAY/retry user gesture, and stop when battle ends. */
export function setBattleMusic(shouldPlay: boolean, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (!shouldPlay || !enabled) {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    return;
  }
  if (timer !== null || !window.AudioContext) return;
  try {
    if (!ctx || ctx.state === 'closed') ctx = new window.AudioContext();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    step = 0;
    nextTime = ctx.currentTime + 0.05;
    schedule();
    timer = window.setInterval(schedule, 65);
  } catch {
    // Music is optional and must not prevent gameplay.
  }
}
