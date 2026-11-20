/**
 * Shared, low-latency Web Audio mixer for original handheld music and effects.
 * One context avoids a new AudioContext for every menu press or dialogue blip.
 * Starts only from a user gesture. No external audio files or copyrighted samples.
 */
export interface AudioEngine {
  ctx: AudioContext;
  music: GainNode;
  effects: GainNode;
  musicActive: boolean;
}
export type AudioBus = 'music' | 'effects';
let engine: AudioEngine | null = null;
const MUSIC_LEVEL = 0.23;

export function getAudioEngine(): AudioEngine | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  try {
    if (!engine || engine.ctx.state === 'closed') {
      const ctx = new window.AudioContext();
      const master = ctx.createGain();
      const music = ctx.createGain();
      const effects = ctx.createGain();
      master.gain.value = 0.85;
      music.gain.value = 0;
      effects.gain.value = 0.36;
      music.connect(master);
      effects.connect(master);
      master.connect(ctx.destination);
      engine = { ctx, music, effects, musicActive: false };
    }
    if (engine.ctx.state === 'suspended') void engine.ctx.resume().catch(() => {});
    return engine;
  } catch {
    return null; // Audio is optional; gameplay must work in every browser.
  }
}

export function setMusicActive(active: boolean): void {
  const current = active ? getAudioEngine() : engine;
  if (!current) return;
  current.musicActive = active;
  const t = current.ctx.currentTime;
  const gain = current.music.gain;
  gain.cancelScheduledValues(t);
  gain.setTargetAtTime(active ? MUSIC_LEVEL : 0, t, active ? 0.14 : 0.055);
}

export function duckMusic(current: AudioEngine, seconds = 0.28): void {
  if (!current.musicActive) return;
  const t = current.ctx.currentTime;
  const gain = current.music.gain;
  gain.cancelScheduledValues(t);
  gain.setTargetAtTime(MUSIC_LEVEL * 0.35, t, 0.018);
  gain.setTargetAtTime(MUSIC_LEVEL, t + seconds, 0.15);
}

export function playTone(
  current: AudioEngine, bus: AudioBus, midi: number, at: number,
  duration: number, level: number, wave: OscillatorType = 'square', slide = 0,
): void {
  const osc = current.ctx.createOscillator();
  const envelope = current.ctx.createGain();
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  osc.type = wave;
  osc.frequency.setValueAtTime(frequency, at);
  if (slide !== 0) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(35, frequency * 2 ** (slide / 12)), at + duration,
    );
  }
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(Math.max(level, 0.0002), at + Math.min(0.009, duration / 3));
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(envelope);
  envelope.connect(current[bus]);
  osc.start(at);
  osc.stop(at + duration + 0.01);
}

export function playNoise(
  current: AudioEngine, bus: AudioBus, at: number, duration: number,
  level: number, cutoff = 1800, filterType: BiquadFilterType = 'highpass',
): void {
  const { ctx } = current;
  const size = Math.max(2, Math.ceil(duration * ctx.sampleRate));
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  let seed = 0x7f3b;
  for (let i = 0; i < size; i++) {
    seed = (seed >> 1) ^ (-(seed & 1) & 0xb400);
    samples[i] = seed & 1 ? 0.8 : -0.8;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const envelope = ctx.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(cutoff, at);
  envelope.gain.setValueAtTime(Math.max(level, 0.0002), at);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(current[bus]);
  source.start(at);
  source.stop(at + duration + 0.01);
}
