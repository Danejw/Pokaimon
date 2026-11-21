import { useState } from 'react';
import { MODELS, MOVES } from '../content/core';
import { rosterForProgress, teamCanHandleEncounters } from '../content/team';
import { PixelPortrait } from './PixelPortrait';
import type { Progress } from '../storage/progress';

type Navigation = {onHome:()=>void};

export function ModelDex({progress,onHome,onTeam}:Navigation&{progress:Progress;onTeam:()=>void}) {
  const roster=rosterForProgress(progress);
  return <section className="modeldex-page retro-page">
    <div className="section-top"><button className="back-button" onClick={onHome}>◀ HOME</button><span>MODELDEX</span></div>
    <h2>ModelDex</h2>
    <p className="intro">Meet your AI companions. Move powers and strengths are simulated game rules. Actual capabilities need independent evidence.</p>
    <div className="modeldex-actions"><button className="secondary" onClick={onTeam}>EDIT TEAM</button><span>{progress.discoveredMoves.length}/{Object.keys(MOVES).length} MOVES DISCOVERED</span></div>
    {roster.map(model=><article className="dex-entry guide-card" key={model.id}>
      <div className="guide-portrait"><PixelPortrait model={model.id as 'astra'|'grok'|'fable'}/></div>
      <div className="guide-card-copy">
        <strong>{model.displayName}</strong>
        <small>{model.provider.toUpperCase()} · VER. {model.version}</small>
        <small>{progress.teamIds.includes(model.id)?'IN YOUR TEAM':'AVAILABLE'} · {progress.winsByModel[model.id]??0} UNIQUE TASK CLEARS</small>
        <p>{model.description}</p>
        <p>GAME BALANCE · FOCUS {model.focus} · TEMPO {model.tempo} · PRECISION {model.precision}</p>
        <details className="dex-moves"><summary>FOUR CAPABILITY MOVES</summary>
          {model.moveIds.map(id=>{const move=MOVES[id];return <p key={id}>
            <b>{progress.discoveredMoves.includes(id)?'✓ DISCOVERED':'? UNTRIED'} · {move.name}</b>
            <span> {move.category.toUpperCase()} · {move.cost} AP. {move.description}</span>
          </p>;})}
        </details>
        <small>DOCUMENTATION CHECKED {model.verifiedAt}</small>
        <a href={model.source} target="_blank" rel="noreferrer">OFFICIAL MODEL DOCUMENTATION ↗</a>
      </div>
    </article>)}
    <p className="disclaimer">LOCAL SIMULATION · GAME BALANCE IS NOT A REAL PROVIDER RANKING.</p>
  </section>;
}

export function TeamEditor({progress,onHome,onSetTeam,onSetAlternate}:Navigation&{
  progress:Progress;onSetTeam:(ids:string[])=>void;onSetAlternate:(enabled:boolean)=>void;
}) {
  const [chosen,setChosen]=useState<string[]>([...progress.teamIds]);
  const [notice,setNotice]=useState('');
  const roster=rosterForProgress(progress);
  const alternateUnlocked=progress.cleared.length>=3;
  function toggle(id:string) {
    setNotice('');
    setChosen(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  }
  function commit() {
    if(chosen.length<1||chosen.length>3){
      setNotice('Select between one and three companions.');return;
    }
    const members=roster.filter(model=>chosen.includes(model.id));
    if(!teamCanHandleEncounters(members)){
      setNotice('That team cannot solve every current wild task. Add a companion with the missing capabilities.');return;
    }
    onSetTeam(chosen);
    setNotice('TEAM SAVED. Your next battle will use this squad.');
  }
  return <section className="team-page retro-page">
    <div className="section-top"><button className="back-button" onClick={onHome}>◀ HOME</button><span>YOUR TEAM</span></div>
    <h2>Build your team</h2>
    <p className="intro">Choose up to three companions. Swap between them during battle. All three starter models are always available.</p>
    {roster.map(model=><label className="team-pick" key={model.id}>
      <input type="checkbox" aria-label={'Team '+model.displayName} checked={chosen.includes(model.id)} onChange={()=>toggle(model.id)}/>
      <span className="squad-icon" aria-hidden="true"><PixelPortrait model={model.id as 'astra'|'grok'|'fable'}/></span>
      <span className="team-pick-copy"><strong>{model.displayName}</strong><small>{model.moveIds.map(id=>MOVES[id].category).join(' · ').toUpperCase()}</small></span>
    </label>)}
    <div className="team-actions">
      <button className="primary" onClick={commit}>SAVE TEAM</button>
      <button className="secondary" onClick={()=>{setChosen(MODELS.map(m=>m.id));setNotice('All starters selected. Save to apply.');}}>RESTORE STARTERS</button>
    </div>
    <p className="team-message" role="status">{notice||'Each selected team must be capable of completing all current wild encounters.'}</p>
    <div className="team-reward">
      <h3>MASTERY REWARD</h3>
      <strong>{alternateUnlocked?'TACTICAL LOADOUT UNLOCKED':'TACTICAL LOADOUT LOCKED'}</strong>
      <p>Complete three different wild tasks to unlock an alternate Astra loadout. Exchange Code Execution for defensive Code Review.</p>
      <label className="team-reward-option">
        <input aria-label="Alternate Astra loadout" type="checkbox" disabled={!alternateUnlocked}
          checked={progress.useAlternateLoadout} onChange={event=>onSetAlternate(event.target.checked)}/>
        <span>Equip alternate Astra moves</span>
      </label>
      <small>{progress.cleared.length}/3 UNIQUE TASKS CLEARED</small>
    </div>
  </section>;
}
