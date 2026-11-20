import { describe, expect, it, vi } from 'vitest';
import { defaultPreferences, loadPreferences, savePreferences } from '../src/storage/preferences';

describe('preferences', () => {
  it('uses defaults when storage is missing', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    expect(loadPreferences()).toEqual(defaultPreferences);
    vi.unstubAllGlobals();
  });
  it('recovers from corrupt preferences', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{ invalid', setItem: () => {} });
    expect(loadPreferences()).toEqual(defaultPreferences);
    vi.unstubAllGlobals();
  });
  it('saves and reloads valid settings', () => {
    const storage = new Map<string,string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k,v) });
    savePreferences({ sound: false, reducedMotion: true, textSpeed: 'fast', difficulty: 'hard' });
    expect(loadPreferences()).toEqual({ sound: false, reducedMotion: true, textSpeed: 'fast', difficulty: 'hard' });
    vi.unstubAllGlobals();
  });
  it('defaults older saved settings to medium', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ sound: false, textSpeed: 'fast' }), setItem: () => {} });
    expect(loadPreferences().difficulty).toBe('medium');
    vi.unstubAllGlobals();
  });
});