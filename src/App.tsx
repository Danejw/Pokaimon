import { useEffect, useState } from 'react';
import { BattleStage } from './game/BattleStage';
import { BattlePanel } from './game/BattlePanel';
import { MODELS, movesFor } from './content/core';
import type { ModelDefinition } from './battle/types';
import { defaultPreferences, loadPreferences, savePreferences, type Preferences } from './storage/preferences';

type Screen = 'home' | 'choose' | 'arena' | 'settings';
export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);
  const [model, setModel] = useState<ModelDefinition>(MODELS[0]);
  useEffect(() => { savePreferences(prefs); }, [prefs]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setScreen(prev => prev === 'arena' ? 'choose' : 'home');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const update = (part: Partial<Preferences>) => setPrefs(old => ({ ...old, ...part }));
  const chooseModel = (m: ModelDefinition) => { setModel(m); setScreen('arena'); };
  return <main className="shell">
    <header className="topline"><span className="brandmark">✦</span><span className="brand">POKAIMON</span><span className="edition">ALPHA 0.3</span></header>
    {screen === 'home' && <section className="home-page">
      <p className="eyebrow">THE AI BATTLE LAB</p>
      <h1>Master your <em>models.</em></h1>
      <p className="intro">Learn AI by picking the right capabilities against real-world problems.</p>
      <div className="home-visual"><BattleStage reducedMotion={prefs.reducedMotion}/><div className="home-overlay"><span>✦</span><strong>A wild TASK approaches!</strong><small>Every problem has a strategy.</small></div></div>
      <div className="home-actions"><button className="primary" onClick={() => setScreen('choose')}>PLAY <span>▶</span></button><button className="secondary" onClick={() => setScreen('settings')}>SETTINGS ⚙</button></div>
      <p className="disclaimer">Original game concept · All battles simulated, no live model execution</p>
    </section>}
    {screen === 'choose' && <section className="select-page">
      <div className="section-top"><button className="back-button" onClick={() => setScreen('home')}>← HOME</button><span className="sim-tag">SIMULATED BATTLE</span></div>
      <p className="eyebrow">YOUR TEAM</p><h2>Choose your AI</h2>
      <p className="intro">Each model equips four real AI techniques. Strength ratings are fictional game balance.</p>
      <div className="model-list">
      {MODELS.map(m => <button className="model-card" key={m.id} onClick={() => chooseModel(m)} aria-label={'Select '+m.displayName}>
        <span className={'model-portrait model-'+m.id} aria-hidden="true"><span className="eyes">• •</span><span className="cheeks">◡</span></span>
        <span className="model-info"><strong>{m.displayName}</strong><small>{m.provider} · {m.description}</small>
          <span className="mini-moves">{movesFor(m).map(move => <span key={move.id} title={move.description}>{move.name}</span>)}</span>
          <span className="model-metrics">FOCUS {m.focus}/5 · TEMPO {m.tempo}/5 · PRECISION {m.precision}/5</span>
        </span><span className="model-arrow">▶</span>
      </button>)}</div>
      <p className="disclaimer">Game-balanced attributes are illustrative. See the source information in the Field Guide coming next phase.</p>
    </section>}
    {screen === 'arena' && <BattlePanel key={model.id} model={model} reducedMotion={prefs.reducedMotion} onBack={() => setScreen('choose')}/>}
    {screen === 'settings' && <section className="settings-page">
      <div className="section-top"><button className="back-button" onClick={() => setScreen('home')}>← HOME</button><span>OPTIONS</span></div>
      <h2>Settings</h2><p className="intro">Make the game comfortable for you.</p>
      <label className="setting"><span><strong>Sound</strong><small>Battle music and effects (when audio launches)</small></span><input aria-label="Sound" type="checkbox" checked={prefs.sound} onChange={e => update({ sound: e.target.checked })}/></label>
      <label className="setting"><span><strong>Reduced motion</strong><small>Fewer animated effects</small></span><input aria-label="Reduced motion" type="checkbox" checked={prefs.reducedMotion} onChange={e => update({ reducedMotion: e.target.checked })}/></label>
      <label className="setting"><span><strong>Text speed</strong><small>Battle dialogue pacing</small></span><select aria-label="Text speed" value={prefs.textSpeed} onChange={e => update({ textSpeed: e.target.value === 'fast' ? 'fast' : 'normal' })}><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
      <button className="secondary full" onClick={() => setPrefs({ ...defaultPreferences })}>RESTORE DEFAULTS</button>
    </section>}
    <footer>POKAIMON · BUILD YOUR BATTLE INSTINCT</footer>
  </main>;
}
