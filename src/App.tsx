import { useCallback, useEffect, useRef, useState } from 'react';
import { BattleStage } from './game/BattleStage';
import { BattlePanel } from './game/BattlePanel';
import { PixelPortrait } from './game/PixelPortrait';
import { ModelDex, TeamEditor } from './game/TeamHub';
import { CampaignPage } from './game/CampaignPage';
import { ChallengePage } from './game/ChallengePage';
import { getChallenge } from './content/challenges';
import { makeEncounter, type ScenarioCode } from './content/variants';
import { buildBattleReplay } from './battle/replay';
import type { CampaignMission } from './content/campaign';
import { rosterForProgress } from './content/team';
import { pickWildEncounter } from './game/encounterFlow';
import { playCue } from './game/sound';
import { setBattleMusic } from './game/music';
import { probeAgui, type AguiProbeResult } from './integrations/agui/client';
import { MODELS, MOVES } from './content/core';
import { ENCOUNTERS } from './content/encounters';
import type { EncounterDefinition, BattleState } from './battle/types';
import { defaultPreferences, loadPreferences, savePreferences, type Preferences } from './storage/preferences';
import { clearProgress, loadProgress, recordBattleProgress, recordMissionVictory, recordChallengeCompletion, recordBattleReplay, saveProgress, setTeam, setAlternateLoadout, type Progress } from './storage/progress';

type Screen='home'|'battle'|'guide'|'settings'|'modeldex'|'team'|'campaign'|'challenges';

export function App(){
  const [screen,setScreen]=useState<Screen>('home');
  const [prefs,setPrefs]=useState<Preferences>(loadPreferences);
  const [progress,setProgress]=useState<Progress>(loadProgress);
  const [encounter,setEncounter]=useState<EncounterDefinition>(ENCOUNTERS[0]);
  const [sessionId,setSessionId]=useState(0);
  const [activeMissionId,setActiveMissionId]=useState<string|null>(null);
  const [activeChallengeId,setActiveChallengeId]=useState<string|null>(null);
  const [activeScenario,setActiveScenario]=useState<ScenarioCode|null>(null);
  const [aguiStatus,setAguiStatus]=useState<AguiProbeResult|null>(null);
  const [testingAgui,setTestingAgui]=useState(false);
  const firstPlay=useRef(true);
  useEffect(()=>{savePreferences(prefs);},[prefs]);
  useEffect(()=>{saveProgress(progress);},[progress]);
  useEffect(()=>{if(screen!=='battle'||!prefs.sound)setBattleMusic(false,false);},[screen,prefs.sound]);
  const recordBattle=useCallback((id:string,battle:BattleState)=>setProgress(old=>{
    let next=recordBattleProgress(old,id,battle);
    if(activeMissionId && battle.outcome==='won')
      next=recordMissionVictory(next,activeMissionId,battle);
    if(!activeMissionId){
      const available=rosterForProgress(old);
      const roster=old.teamIds.map(teamId=>available.find(model=>model.id===teamId))
        .filter((model):model is typeof available[number]=>!!model);
      const replay=buildBattleReplay(battle,{
        encounterId:id,modifierIds:activeScenario?.modifierIds??[],roster,
      });
      next=recordBattleReplay(next,replay);
      if(activeChallengeId){
        const challenge=getChallenge(activeChallengeId);
        if(challenge)next=recordChallengeCompletion(next,challenge,battle,replay);
      }
    }
    return next;
  }),[activeMissionId,activeScenario,activeChallengeId]);
  const roster = rosterForProgress(progress);
  const activeTeam = progress.teamIds.map(id=>roster.find(model=>model.id===id)).filter((model):model is typeof roster[number]=>!!model);
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
    setActiveMissionId(null);
    setActiveChallengeId(null);
    setActiveScenario(null);
    const override=firstPlay.current?new URLSearchParams(window.location.search).get('encounter'):null;
    firstPlay.current=false;
    setEncounter(pickWildEncounter(ENCOUNTERS,Math.random,override));
    setSessionId(id=>id+1);
    setScreen('battle');
    setBattleMusic(true,prefs.sound);
    playCue('encounter',prefs.sound);
  };
  const launchMission=(mission:CampaignMission)=>{
    setActiveScenario(null);
    setActiveChallengeId(null);
    setActiveMissionId(mission.id);
    setEncounter(mission.encounter);
    setSessionId(id=>id+1);
    setScreen('battle');
    setBattleMusic(true,prefs.sound);
    playCue('encounter',prefs.sound);
  };
  const launchChallenge=(scenario:ScenarioCode,challengeId:string|null)=>{
    const encounter=makeEncounter(scenario.encounterId,scenario.seed,scenario.modifierIds);
    if(!encounter)return;
    setActiveMissionId(null);
    setActiveChallengeId(challengeId);
    setActiveScenario(scenario);
    setEncounter(encounter);
    setSessionId(id=>id+1);
    setScreen('battle');
    setBattleMusic(true,prefs.sound);
    playCue('encounter',prefs.sound);
  };
  return <main className={'shell retro-shell' + (screen === 'battle' ? ' is-battling' : '')}>
    <header className="topline retro-header">
      <span className="brandmark">✦</span>
      <span className="brand">POKAIMON</span>
    </header>

    {screen==='home'&&<section className="home-page retro-home">
      <h1>Master your<br/><em>models.</em></h1>
      <p className="intro">WILD TASKS ARE OUT THERE. CHOOSE YOUR AI. LEARN ITS MOVES. WIN THE BATTLE.</p>
      <div className="home-visual retro-preview">
        <BattleStage enemy="TASK" phase="encounter" reducedMotion={true}/>
        <div className="home-overlay"><span>✦</span><strong>A wild TASK approaches!</strong><small>THE ADVENTURE BEGINS</small></div>
      </div>
      <div className="home-actions">
        <button className="primary retro-primary" onClick={launchEncounter}>▶ PLAY</button>
        <button className="secondary retro-secondary" onClick={()=>setScreen('campaign')}>CAMPAIGN</button>
      </div>
      <div className="home-submenu"><button className="text-button retro-text-button" onClick={()=>setScreen('challenges')}>CHALLENGES</button>
        <button className="text-button retro-text-button" onClick={()=>setScreen('modeldex')}>MODELDEX</button>
        <button className="text-button retro-text-button" onClick={()=>setScreen('team')}>TEAM</button>
        <button className="text-button retro-text-button" onClick={()=>setScreen('guide')}>FIELD GUIDE</button>
        <button className="text-button retro-text-button" onClick={()=>setScreen('settings')}>⚙ SETTINGS</button></div>
    </section>}

    {screen==='battle'&&<BattlePanel key={sessionId} encounter={encounter} roster={activeTeam}
      seed={activeScenario?.seed??1} challenge={activeChallengeId?getChallenge(activeChallengeId):undefined}
      reducedMotion={prefs.reducedMotion} soundEnabled={prefs.sound} textSpeed={prefs.textSpeed} difficulty={prefs.difficulty}
      nextLabel={activeMissionId?'▶ CHAPTER SELECT':activeScenario?'▶ CHALLENGES':undefined}
      onHome={()=>setScreen('home')} onNext={activeMissionId?()=>setScreen('campaign'):activeScenario?()=>setScreen('challenges'):launchEncounter} onFinish={recordBattle}/>}

    {screen==='challenges'&&<ChallengePage progress={progress} onHome={()=>setScreen('home')} onLaunch={launchChallenge}/>}

    {screen==='campaign'&&<CampaignPage progress={progress} onHome={()=>setScreen('home')} onLaunch={launchMission}/>}

    {screen==='modeldex'&&<ModelDex progress={progress} onHome={()=>setScreen('home')} onTeam={()=>setScreen('team')}/>}
    {screen==='team'&&<TeamEditor progress={progress} onHome={()=>setScreen('home')}
      onSetTeam={ids=>setProgress(old=>setTeam(old,ids))}
      onSetAlternate={enabled=>setProgress(old=>setAlternateLoadout(old,enabled))}/>}

    {screen==='guide'&&<section className="guide-page retro-page">
      <div className="section-top"><button className="back-button" onClick={()=>setScreen('home')}>◀ HOME</button><span>FIELD GUIDE</span></div>
      <h2>Know your moves</h2>
      <p className="intro">Learn when to use each move. Battles run on game rules, with no live AI calls.</p>
      <h3>YOUR AI TEAM</h3>
      {MODELS.map(m=><article className="guide-card" key={m.id}>
        <span className="guide-portrait" aria-hidden="true"><PixelPortrait model={m.id} /></span>
        <div className="guide-card-copy">
          <strong>{m.displayName}</strong>
          <small>{m.provider.toUpperCase()} · VER. {m.version}</small>
          
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
      <h2>Settings</h2>
      <label className="setting"><span><strong>Difficulty</strong><small>Choose how much battle guidance you see</small></span>
        <select aria-label="Difficulty" value={prefs.difficulty} onChange={e=>update({difficulty:e.target.value as Preferences['difficulty']})}>
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
      <p className="difficulty-description">{prefs.difficulty==='easy'?'Move effectiveness, damage, and step hints are shown.':prefs.difficulty==='medium'?'Learn move techniques through trial and error. Damage and recommended moves are hidden.':'No move forecasts, step hints, or tactical warnings. Read the battle and experiment.'}</p>
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
          <h3>AG-UI CONNECTION</h3><p>Check the local standards endpoint. No AI provider calls.</p>
          <button className="secondary full" disabled={testingAgui} onClick={()=>{
            setTestingAgui(true);setAguiStatus(null);
            void probeAgui().then(setAguiStatus).finally(()=>setTestingAgui(false));
          }}>{testingAgui?'CONNECTING...':'TEST AG-UI CONNECTION'}</button>
          {aguiStatus&&<p role="status">{aguiStatus.error?'AG-UI error: '+aguiStatus.error:aguiStatus.finished?'AG-UI connected: '+aguiStatus.message:'AG-UI run unfinished'}</p>}
        </div>}
      <button className="danger-button" onClick={()=>setProgress(clearProgress())}>RESET FIELD GUIDE PROGRESS</button>
    </section>}
  </main>;
}
