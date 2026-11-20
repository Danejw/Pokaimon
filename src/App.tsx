import { useCallback, useEffect, useState } from 'react';
import { probeAgui, type AguiProbeResult } from './integrations/agui/client';
import { BattleStage } from './game/BattleStage';
import { BattlePanel } from './game/BattlePanel';
import { MODELS, MOVES, movesFor } from './content/core';
import { ENCOUNTERS, canUseModel, isUnlocked, missingForModel } from './content/encounters';
import type { ModelDefinition, EncounterDefinition } from './battle/types';
import { defaultPreferences, loadPreferences, savePreferences, type Preferences } from './storage/preferences';
import { clearProgress, loadProgress, markCleared, saveProgress, type Progress } from './storage/progress';

type Screen='home'|'encounters'|'choose'|'arena'|'guide'|'settings';
export function App(){
  const [screen,setScreen]=useState<Screen>('home');
  const [prefs,setPrefs]=useState<Preferences>(loadPreferences);
  const [progress,setProgress]=useState<Progress>(loadProgress);
  const [aguiStatus,setAguiStatus]=useState<AguiProbeResult|null>(null);
  const [testingAgui,setTestingAgui]=useState(false);
  const [model,setModel]=useState<ModelDefinition>(MODELS[0]);
  const [encounter,setEncounter]=useState<EncounterDefinition>(ENCOUNTERS[0]);
  useEffect(()=>{savePreferences(prefs)},[prefs]);
  useEffect(()=>{saveProgress(progress)},[progress]);
  const recordWin=useCallback((id:string)=>setProgress(old=>markCleared(old,id)),[]);
  useEffect(()=>{
    function onKey(e:KeyboardEvent){if(e.key==='Escape')setScreen(prev=>prev==='arena'?'encounters':prev==='choose'?'encounters':'home');}
    window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);
  },[]);
  const update=(part:Partial<Preferences>)=>setPrefs(old=>({...old,...part}));
  const chooseEncounter=(e:EncounterDefinition)=>{setEncounter(e);setScreen('choose')};
  const chooseModel=(m:ModelDefinition)=>{setModel(m);setScreen('arena')};
  return <main className="shell">
    <header className="topline"><span className="brandmark">✦</span><span className="brand">POKAIMON</span><span className="edition">ALPHA 0.4</span></header>
    {screen==='home'&&<section className="home-page">
      <p className="eyebrow">THE AI BATTLE LAB</p><h1>Master your <em>models.</em></h1>
      <p className="intro">Battle real-world problems and learn which AI capabilities work best.</p>
      <div className="home-visual"><BattleStage reducedMotion={prefs.reducedMotion}/><div className="home-overlay"><span>✦</span><strong>A wild TASK approaches!</strong><small>Five battles. Three models. Real techniques.</small></div></div>
      <div className="home-actions"><button className="primary" onClick={()=>setScreen('encounters')}>PLAY <span>▶</span></button><button className="secondary" onClick={()=>setScreen('guide')}>FIELD GUIDE ◈</button></div>
      <button className="text-button" onClick={()=>setScreen('settings')}>⚙ SETTINGS</button>
      <p className="disclaimer">All battles simulated · No real AI execution</p>
    </section>}
    {screen==='encounters'&&<section className="encounters-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('home')}>← HOME</button><span className="sim-tag">SIMULATION</span></div>
      <p className="eyebrow">WILD ENCOUNTERS</p><h2>Choose a challenge</h2>
      <p className="intro">Each enemy represents a real-world problem. Defeat one to unlock the next.</p>
      <div className="encounter-list">
        {ENCOUNTERS.map((e,i)=>{
          const unlocked=isUnlocked(e.id,progress.cleared);
          const cleared=progress.cleared.includes(e.id);
          return <button key={e.id} className="encounter-card" disabled={!unlocked} onClick={()=>chooseEncounter(e)} aria-label={'Challenge '+e.name}>
            <span className="encounter-id">{unlocked?String(i+1).padStart(2,'0'):'🔒'}</span>
            <span className="encounter-content"><strong>{e.name}</strong><small>{e.category} · Lv.{e.level} · {e.description}</small></span>
            <span className="encounter-status">{cleared?'✓ CLEAR':unlocked?'BATTLE':'LOCKED'}</span>
          </button>
        })}
      </div><p className="disclaimer">{progress.cleared.length} / {ENCOUNTERS.length} challenges cleared</p>
    </section>}
    {screen==='choose'&&<section className="select-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('encounters')}>← CHALLENGES</button><span className="sim-tag">SIMULATED BATTLE</span></div>
      <p className="eyebrow">YOUR TEAM VS {encounter.name}</p><h2>Choose your AI</h2>
      <p className="intro">Match real capability types to the problem stages. Stats are fictional game balance.</p>
      <div className="model-list">
      {MODELS.map(m=>{
        const capable=canUseModel(encounter,m);
        return <button className="model-card" key={m.id} onClick={()=>chooseModel(m)} aria-label={'Select '+m.displayName}>
          <span className={'model-portrait model-'+m.id} aria-hidden="true"><span className="eyes">• •</span><span className="cheeks">◡</span></span>
          <span className="model-info"><strong>{m.displayName}</strong><small>{m.provider} · {m.description}</small>
            <span className="mini-moves">{movesFor(m).map(move=><span key={move.id} title={move.description}>{move.name}</span>)}</span>
            <span className={capable?'model-metrics':'model-warning'}>{capable?'✓ Complete move coverage':'⚠ Missing: '+missingForModel(encounter,m).join(', ')}</span>
          </span><span className="model-arrow">▶</span>
        </button>;
      })}</div>
      <p className="disclaimer">A weak matchup can still be tried, but may be impossible to win without the needed capability.</p>
    </section>}
    {screen==='arena'&&<BattlePanel key={model.id+'-'+encounter.id} model={model} encounter={encounter} reducedMotion={prefs.reducedMotion} soundEnabled={prefs.sound} onBack={()=>setScreen('encounters')} onWin={recordWin}/>}
    {screen==='guide'&&<section className="guide-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('home')}>← HOME</button><span>FIELD GUIDE</span></div>
      <h2>Know your moves</h2><p className="intro">This is a game about AI capability types. Abilities are educational simulations; provider-specific support must be verified before live use.</p>
      <h3>AI models</h3>
      {MODELS.map(m=><article className="guide-card" key={m.id}><strong>{m.displayName}</strong><small>{m.provider} · Version {m.version} · Profile checked {m.verifiedAt}</small><p>{m.description}</p><a href={m.source} target="_blank" rel="noreferrer">Provider documentation ↗</a></article>)}
      <h3>Moves & capability types</h3>
      {Object.values(MOVES).map(move=><article className="guide-card" key={move.id}><strong>{move.name} <span className="guide-tag">{move.category}</span></strong><p>{move.description} {move.lesson}</p><small>{move.toolRequired?'Real tool needed: '+move.toolRequired:'Reasoning / review technique'}</small></article>)}
      <h3>Wild encounters</h3>
      {ENCOUNTERS.map(e=><article className="guide-card" key={e.id}><strong>{e.name}</strong><p>{e.lesson}</p><small>{progress.cleared.includes(e.id)?'CLEARED':'Not yet cleared'} · {e.stages.length} stages</small></article>)}
    </section>}
    {screen==='settings'&&<section className="settings-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('home')}>← HOME</button><span>OPTIONS</span></div>
      <h2>Settings</h2><p className="intro">Make the game comfortable for you.</p>
      <label className="setting"><span><strong>Sound</strong><small>Battle effects when enabled</small></span><input aria-label="Sound" type="checkbox" checked={prefs.sound} onChange={e=>update({sound:e.target.checked})}/></label>
      <label className="setting"><span><strong>Reduced motion</strong><small>Reduce sprite and UI animation</small></span><input aria-label="Reduced motion" type="checkbox" checked={prefs.reducedMotion} onChange={e=>update({reducedMotion:e.target.checked})}/></label>
      <label className="setting"><span><strong>Text speed</strong><small>Dialogue preference</small></span><select aria-label="Text speed" value={prefs.textSpeed} onChange={e=>update({textSpeed:e.target.value==='fast'?'fast':'normal'})}><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
      <button className="secondary full" onClick={()=>setPrefs({...defaultPreferences})}>RESTORE DEFAULTS</button>
      {(window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1') && <div className="agui-diagnostic">
        <h3>AG-UI simulator</h3><p>Test the local standards endpoint. This sends no requests to AI providers.</p>
        <button className="secondary full" disabled={testingAgui} onClick={()=>{
          setTestingAgui(true);setAguiStatus(null);
          void probeAgui().then(setAguiStatus).finally(()=>setTestingAgui(false));
        }}>{testingAgui?'CONNECTING...':'TEST AG-UI CONNECTION'}</button>
        {aguiStatus && <p role="status">{aguiStatus.error?'AG-UI error: '+aguiStatus.error:aguiStatus.finished?'AG-UI simulation connected: '+aguiStatus.message:'AG-UI run unfinished'}</p>}
      </div>}
      <button className="danger-button" onClick={()=>{setProgress(clearProgress());}}>RESET CAMPAIGN PROGRESS</button>
    </section>}
    <footer>POKAIMON · BUILD YOUR BATTLE INSTINCT</footer>
  </main>;
}