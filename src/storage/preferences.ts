export interface Preferences {
  sound: boolean;
  reducedMotion: boolean;
  textSpeed: 'normal' | 'fast';
}
export const defaultPreferences: Preferences = { sound: true, reducedMotion: false, textSpeed: 'normal' };
const KEY = 'pokaimon:preferences:v1';

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultPreferences };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return { ...defaultPreferences };
    const object = value as Record<string, unknown>;
    return {
      sound: typeof object.sound === 'boolean' ? object.sound : true,
      reducedMotion: typeof object.reducedMotion === 'boolean' ? object.reducedMotion : false,
      textSpeed: object.textSpeed === 'fast' ? 'fast' : 'normal',
    };
  } catch { return { ...defaultPreferences }; }
}

export function savePreferences(value: Preferences): void {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* private browsing / full storage */ }
}