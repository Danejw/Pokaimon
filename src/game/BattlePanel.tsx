import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { BattleStage } from './BattleStage';
import { playCue } from './sound';
import { applyMove, createBattle, summarizeBattle, totalProgress } from '../battle/engine';
import { movesFor } from '../content/core';
import type { BattleState, ModelDefinition, EncounterDefinition } from '../battle/types';

export function BattlePanel({ model, encounter, reducedMotion, onBack, onWin, soundEnabled, textSpeed }: { model: ModelDefinition; encounter: EncounterDefinition; reducedMotion: boolean; onBack: () => void; onWin: (id: string) => void; soundEnabled: boolean; textSpeed: 'normal'|'fast' }) {
  const [battle, setBattle] = useState<BattleState>(() => createBattle(encounter,model));
  useEffect(() => { if (battle.outcome === 'won') onWin(encounter.id); }, [battle.outcome, encounter.id, onWin]);
  const moveButtons=useRef<Array<HTMLButtonElement|null>>([]);
  const [typedFeedback,setTypedFeedback]=useState(battle.feedback);
  useEffect(()=>{
    if(reducedMotion||textSpeed==='fast'){
      setTypedFeedback(battle.feedback);
      return;
    }
    let count=0;
    setTypedFeedback('');
    const timer=window.setInterval(()=>{
      count=Math.min(battle.feedback.length,count+5);
      setTypedFeedback(battle.feedback.slice(0,count));
      if(count>=battle.feedback.length)window.clearInterval(timer);
    },18);
    return ()=>window.clearInterval(timer);
  },[battle.feedback,reducedMotion,textSpeed]);
  function onMoveKeyDown(event: KeyboardEvent<HTMLDivElement>){
    const key=event.key.toLowerCase();
    const vertical=['arrowup','arrowdown','w','s'].includes(key);
    const horizontal=['arrowleft','arrowright','a','d'].includes(key);
    if(!vertical&&!horizontal)return;
    event.preventDefault();
    const current=moveButtons.current.findIndex(el=>el===document.activeElement);
    const index=current>=0?current:0;
    const next=vertical?(index+2)%4:index^1;
    moveButtons.current[next]?.focus();
  }
  const moves = movesFor(model);
  const stage = encounter.stages[battle.stageIndex];
  const latest = battle.events.slice(-4).reverse();
  function useMove(id: string) {
    const next=applyMove(battle,id,model,encounter);
    if(next===battle)return;
    playCue(next.outcome==='won'?'win':next.outcome==='lost'?'lose':'hit',soundEnabled);
    setBattle(next);
  }
  return <section className="arena-page">
    <div className="section-top">
      <button className="back-button" onClick={onBack}>← CHALLENGES</button>
      <span className="sim-tag">SIMULATED BATTLE</span>
    </div>
    <div className="battle-hud">
      <div><strong>{encounter.name}</strong> <small>Lv.{encounter.level}</small></div>
      <div className="hp-track" role="meter" aria-label="Task completion" aria-valuenow={totalProgress(battle)} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: totalProgress(battle) + '%' }}/></div>
      <small>{totalProgress(battle)}% resolved · stage {Math.min(battle.stageIndex + 1, encounter.stages.length)}/{encounter.stages.length}</small>
    </div>
    <div className="battle-visual"><BattleStage enemy={encounter.name} model={model.id} reducedMotion={reducedMotion} effect={battle.turn ? String(battle.turn) : ''}/></div>
    <div className="agent-bar"><strong>{model.displayName}</strong><span>AP {battle.ap}/{battle.maxAp} · TURN {battle.turn}</span></div>
    <div className="dialogue-box battle-dialogue">
      <p>{battle.outcome === 'active' ? (stage?.label + ': ' + stage?.hint) : (battle.outcome === 'won' ? encounter.name + ' completed!' : 'Battle lost!')}</p>
      <small aria-hidden="true">{typedFeedback}</small><span className="sr-only" role="status" aria-live="polite">{battle.feedback}</span>
    </div>
    {battle.outcome === 'active' ? <>
      <div className="move-heading"><strong>CHOOSE A MOVE</strong><small>Stage {battle.stageIndex + 1}: {stage?.label}</small></div>
      <div className="move-grid" onKeyDown={onMoveKeyDown} aria-label="Move selection">
      {moves.map((move,index) => <button ref={node=>{moveButtons.current[index]=node;}} key={move.id} className="move-button" onClick={() => useMove(move.id)} disabled={battle.ap < move.cost} aria-label={move.name} title={move.description + " " + move.lesson}>
        <b>{move.name}</b><small>{move.category.toUpperCase()} · {move.cost} AP</small>
      </button>)}</div>
      <p className="move-note">Tip: Match the move to the current stage. Arrow keys or WASD navigate; Enter selects. Wrong moves cost AP.</p>
    </> : <div className="result-panel">
      <h2>{battle.outcome === 'won' ? 'VICTORY!' : 'TRY AGAIN'}</h2>
      <p>{summarizeBattle(battle, encounter)}</p>
      <button className="primary full" onClick={() => setBattle(createBattle(encounter, model))}>RETRY BATTLE ↻</button>
      <button className="secondary full" onClick={onBack}>MORE CHALLENGES</button>
    </div>}
    <details className="battle-log"><summary>Battle log ({battle.events.length} events)</summary>
      {latest.map(event => <p key={event.seq}><b>#{event.turn}</b> {event.message}</p>)}
    </details>
  </section>;
}
