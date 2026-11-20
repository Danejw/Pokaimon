import { useEffect, useState } from 'react';
import { BattleStage } from './game/BattleStage';
import { defaultPreferences, loadPreferences, savePreferences, type Preferences } from './storage/preferences';

type Screen = 'home' | 'arena' | 'settings';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);
  useEffect(() => { savePreferences(prefs); }, [prefs]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setScreen('home'); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const update = (part: Partial<Preferences>) => setPrefs(old => ({ ...old, ...part }));
  return (
    <main className="shell">
      <header className="topline"><span className="brandmark">✦</span><span className="brand">POKAIMON</span><span className="edition">ALPHA 0.1</span></header>
      {screen === 'home' && <section className="home-page">
        <p className="eyebrow">THE AI BATTLE LAB</p>
        <h1>Master your <em>models.</em></h1>
        <p className="intro">Learn the strengths of AI through clever moves and wild problems.</p>
        <div className="home-visual"><BattleStage reducedMotion={prefs.reducedMotion}/><div className="home-overlay"><span>✦</span><strong>A wild TASK approaches!</strong><small>Every problem has a strategy.</small></div></div>
        <div className="home-actions"><button className="primary" onClick={() => setScreen('arena')}>PLAY <span>▶</span></button><button className="secondary" onClick={() => setScreen('settings')}>SETTINGS ⚙</button></div>
        <p className="disclaimer">Original game concept · AI simulations, not live model execution</p>
      </section>}
      {screen === 'arena' && <section className="arena-page">
        <div className="section-top"><button className="back-button" onClick={() => setScreen('home')}>← HOME</button><span className="sim-tag">GAME PREVIEW</span></div>
        <BattleStage reducedMotion={prefs.reducedMotion}/>
        <div className="dialogue-box"><p>A wild TASK appeared!</p><small>The first playable battle arrives in Phase 1.</small></div>
        <button className="secondary full" onClick={() => setScreen('home')}>BACK TO HOME</button>
      </section>}
      {screen === 'settings' && <section className="settings-page">
        <div className="section-top"><button className="back-button" onClick={() => setScreen('home')}>← HOME</button><span>OPTIONS</span></div>
        <h2>Settings</h2><p className="intro">Make the game comfortable for you.</p>
        <label className="setting"><span><strong>Sound</strong><small>Battle music and effects</small></span><input aria-label="Sound" type="checkbox" checked={prefs.sound} onChange={e => update({ sound: e.target.checked })}/></label>
        <label className="setting"><span><strong>Reduced motion</strong><small>Fewer animated effects</small></span><input aria-label="Reduced motion" type="checkbox" checked={prefs.reducedMotion} onChange={e => update({ reducedMotion: e.target.checked })}/></label>
        <label className="setting"><span><strong>Text speed</strong><small>Battle dialogue pacing</small></span><select aria-label="Text speed" value={prefs.textSpeed} onChange={e => update({ textSpeed: e.target.value === 'fast' ? 'fast' : 'normal' })}><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
        <button className="secondary full" onClick={() => setPrefs({ ...defaultPreferences })}>RESTORE DEFAULTS</button>
      </section>}
      <footer>POKAIMON · BUILD YOUR BATTLE INSTINCT</footer>
    </main>
  );
}