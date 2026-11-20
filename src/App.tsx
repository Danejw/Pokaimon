import { useCallback, useEffect, useRef, useState } from 'react';
import { BattleStage } from './game/BattleStage';
import { BattlePanel } from './game/BattlePanel';
import { PixelPortrait } from './game/PixelPortrait';
import { pickWildEncounter } from './game/encounterFlow';
import { playCue } from './game/sound';
import { setBattleMusic } from './game/music';
import { probeAgui, type AguiProbeResult } from './integrations/agui/client';
import { MODELS, MOVES } from './content/core';
import { ENCOUNTERS } from './content/encounters';
import type { EncounterDefinition } from './battle/types';
import { defaultPreferences, loadPreferences, savePreferences, type Preferences } from './storage/preferences';
import { clearProgress, loadProgress, markCleared, saveProgress, type Progress } from './storage/progress';

type Screen='home'|'battle'|'guide'|'settings';

export function App(){
  const [screen,setScreen]=useState<Screen>('home');
  const [prefs,setPrefs]=useState<Preferences>(loadPreferences);
  const [progress,setProgress]=useState<Progress>(loadProgress);
  const [encounter,setEncounter]=useState<EncounterDefinition>(ENCOUNTERS[0]);
  const [sessionId,setSessionId]=useState(0);
  const [aguiStatus,setAguiStatus]=useState<AguiProbeResult|null>(null);
  const [testingAgui,setTestingAgui]=useState(false);
  const firstPlay=useRef(true);
  useEffect(()=>{savePreferences(prefs);},[prefs]);
  useEffect(()=>{saveProgress(progress);},[progress]);
  useEffect(()=>{if(screen!=='battle'||!prefs.sound)setBattleMusic(false,false);},[screen,prefs.sound]);
  const recordWin=useCallback((id:string)=>setProgress(old=>markCleared(old,id)),[]);
  useEffect(()=>{
    function onKey(event:KeyboardEvent){
      if(event.key==='Escape'&&event.target instanceof HTMLElement &&
        ['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;
      if(event.key==='Escape')setScreen('home');
    }
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[]);
  const update=(part:Partial<Preferences>)=>setPrefs(old=>({...old,...part}));
  const launchEncounter=()=>{
    const override=firstPlay.current?new URLSearchParams(window.location.search).get('encounter'):null;
    firstPlay.current=false;
    setEncounter(pickWildEncounter(ENCOUNTERS,Math.random,override));
    setSessionId(id=>id+1);
    setScreen('battle');
    playCue('encounter',prefs.sound);
    setBattleMusic(true,prefs.sound);
  };
  return <main className={'shell retro-shell' + (screen === 'battle' ? ' is-battling' : '')}>
    <header className="topline retro-header">
      <span className="brandmark">✦</span>
      <span className="brand">POKAIMON</span>
      <span className="edition">16-BIT AI LAB</span>
    </header>

    {screen==='home'&&<section className="home-page retro-home">
      <p className="eyebrow">A NEW KIND OF WILD ENCOUNTER</p>
      <h1>Master your<br/><em>models.</em></h1>
      <p className="intro">WILD TASKS ARE OUT THERE. CHOOSE YOUR AI. LEARN ITS MOVES. WIN THE BATTLE.</p>
      <div className="home-visual retro-preview">
        <BattleStage enemy="TASK" phase="encounter" reducedMotion={true}/>
        <div className="home-overlay"><span>✦</span><strong>A wild TASK approaches!</strong><small>THE ADVENTURE BEGINS</small></div>
      </div>
      <div className="home-actions">
        <button className="primary retro-primary" onClick={launchEncounter}>▶ PLAY</button>
        <button className="secondary retro-secondary" onClick={()=>setScreen('guide')}>FIELD GUIDE</button>
      </div>
      <button className="text-button retro-text-button" onClick={()=>setScreen('settings')}>⚙ SETTINGS</button>
      <p className="disclaimer">ORIGINAL PIXEL-ART SIMULATOR · NO LIVE MODEL EXECUTION</p>
    </section>}

    {screen==='battle'&&<BattlePanel key={sessionId} encounter={encounter}
      reducedMotion={prefs.reducedMotion} soundEnabled={prefs.sound} textSpeed={prefs.textSpeed}
      onHome={()=>setScreen('home')} onNext={launchEncounter} onWin={recordWin}/>}

    {screen==='guide'&&<section className="guide-page retro-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('home')}>◀ HOME</button><span>FIELD GUIDE</span></div>
      <h2>Know your moves</h2>
      <p className="intro">Every move represents a real AI technique. Battle power and stats are simulated game rules.</p>
      <h3>YOUR AI TEAM</h3>
      {MODELS.map(m=><article className="guide-card" key={m.id}>
        <span className="guide-portrait" aria-hidden="true"><PixelPortrait model={m.id as 'astra' | 'grok' | 'fable'} /></span>
        <div className="guide-card-copy">
          <strong>{m.displayName}</strong>
          <small>{m.provider.toUpperCase()} · VER. {m.version}</small>
          <p>{m.description}</p>
          <a href={m.source} target="_blank" rel="noreferrer">OFFICIAL MODEL DOCUMENTATION ↗</a>
        </div>
      </article>)}
      <h3>CAPABILITY MOVES</h3>
      {Object.values(MOVES).map(move=><article className="guide-card" key={move.id}>
        <strong>{move.name} <span className="guide-tag">{move.category}</span></strong>
        <p>{move.description} {move.lesson}</p>
        <small>{move.toolRequired?'REQUIRES REAL TOOL: '+move.toolRequired:'REASONING OR REVIEW TECHNIQUE'}</small>
      </article>)}
      <h3>WILD PROBLEMS</h3>
      {ENCOUNTERS.map(e=><article className="guide-card" key={e.id}>
        <strong>{e.name} <span className="guide-tag">LV.{e.level}</span></strong>
        <p>{e.lesson}</p>
        <small>{progress.cleared.includes(e.id)?'✓ DEFEATED':'UNDISCOVERED'} · {e.stages.length} STAGES</small>
      </article>)}
      <p className="disclaimer">ALL PROGRESS IS STORED ON THIS DEVICE.</p>
    </section>}

    {screen==='settings'&&<section className="settings-page retro-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('home')}>◀ HOME</button><span>OPTIONS</span></div>
      <h2>Settings</h2><p className="intro">SET UP YOUR HANDHELD EXPERIENCE.</p>
      <label className="setting"><span><strong>Sound</strong><small>Retro sound effects</small></span>
        <input aria-label="Sound" type="checkbox" checked={prefs.sound} onChange={e=>update({sound:e.target.checked})}/></label>
      <label className="setting"><span><strong>Reduced motion</strong><small>Skip elaborate attack effects</small></span>
        <input aria-label="Reduced motion" type="checkbox" checked={prefs.reducedMotion} onChange={e=>update({reducedMotion:e.target.checked})}/></label>
      <label className="setting"><span><strong>Text speed</strong><small>Battle dialogue reveal</small></span>
        <select aria-label="Text speed" value={prefs.textSpeed} onChange={e=>update({textSpeed:e.target.value==='fast'?'fast':'normal'})}>
          <option value="normal">Normal</option><option value="fast">Fast</option></select></label>
      <button className="secondary full" onClick={()=>setPrefs({...defaultPreferences})}>RESTORE DEFAULTS</button>
      {(window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1')&&
        <div className="agui-diagnostic">
          <h3>AG-UI SIMULATION</h3><p>Check the local standards endpoint. No AI provider calls.</p>
          <button className="secondary full" disabled={testingAgui} onClick={()=>{
            setTestingAgui(true);setAguiStatus(null);
            void probeAgui().then(setAguiStatus).finally(()=>setTestingAgui(false));
          }}>{testingAgui?'CONNECTING...':'TEST AG-UI CONNECTION'}</button>
          {aguiStatus&&<p role="status">{aguiStatus.error?'AG-UI error: '+aguiStatus.error:aguiStatus.finished?'AG-UI simulation connected: '+aguiStatus.message:'AG-UI run unfinished'}</p>}
        </div>}
      <button className="danger-button" onClick={()=>setProgress(clearProgress())}>RESET FIELD GUIDE PROGRESS</button>
    </section>}
    <footer className="retro-footer">POKAIMON · BUILD YOUR BATTLE INSTINCT</footer>
  </main>;
}
