import { useState } from 'react';
import { BattleStage } from './BattleStage';
import { applyMove, createBattle, summarizeBattle, totalProgress } from '../battle/engine';
import { TASK, movesFor } from '../content/core';
import type { BattleState, ModelDefinition } from '../battle/types';

export function BattlePanel({ model, reducedMotion, onBack }: { model: ModelDefinition; reducedMotion: boolean; onBack: () => void }) {
  const [battle, setBattle] = useState<BattleState>(() => createBattle(TASK,model));
  const moves = movesFor(model);
  const stage = TASK.stages[battle.stageIndex];
  const latest = battle.events.slice(-4).reverse();
  function useMove(id: string) { setBattle(prev => applyMove(prev, id, model, TASK)); }
  return <section className="arena-page">
    <div className="section-top">
      <button className="back-button" onClick={onBack}>← MODELS</button>
      <span className="sim-tag">SIMULATED BATTLE</span>
    </div>
    <div className="battle-hud">
      <div><strong>TASK</strong> <small>Lv.{TASK.level}</small></div>
      <div className="hp-track" role="meter" aria-label="Task completion" aria-valuenow={totalProgress(battle)} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: totalProgress(battle) + '%' }}/></div>
      <small>{totalProgress(battle)}% resolved · stage {Math.min(battle.stageIndex + 1, TASK.stages.length)}/{TASK.stages.length}</small>
    </div>
    <div className="battle-visual"><BattleStage enemy={TASK.name} model={model.id} reducedMotion={reducedMotion} effect={battle.turn ? String(battle.turn) : ''}/></div>
    <div className="agent-bar"><strong>{model.displayName}</strong><span>AP {battle.ap}/{battle.maxAp} · TURN {battle.turn}</span></div>
    <div className="dialogue-box battle-dialogue" role="status" aria-live="polite">
      <p>{battle.outcome === 'active' ? (stage?.label + ': ' + stage?.hint) : (battle.outcome === 'won' ? 'TASK completed!' : 'Battle lost!')}</p>
      <small>{battle.feedback}</small>
    </div>
    {battle.outcome === 'active' ? <>
      <div className="move-heading"><strong>CHOOSE A MOVE</strong><small>Stage {battle.stageIndex + 1}: {stage?.label}</small></div>
      <div className="move-grid">
      {moves.map(move => <button key={move.id} className="move-button" onClick={() => useMove(move.id)} disabled={battle.ap < move.cost} aria-label={move.name} title={move.description + " " + move.lesson}>
        <b>{move.name}</b><small>{move.category.toUpperCase()} · {move.cost} AP</small>
      </button>)}</div>
      <p className="move-note">Tip: Match the move to the current task stage. Wrong moves still cost AP.</p>
    </> : <div className="result-panel">
      <h2>{battle.outcome === 'won' ? 'VICTORY!' : 'TRY AGAIN'}</h2>
      <p>{summarizeBattle(battle)}</p>
      <button className="primary full" onClick={() => setBattle(createBattle(TASK, model))}>RETRY BATTLE ↻</button>
      <button className="secondary full" onClick={onBack}>BACK HOME</button>
    </div>}
    <details className="battle-log"><summary>Battle log ({battle.events.length} events)</summary>
      {latest.map(event => <p key={event.seq}><b>#{event.turn}</b> {event.message}</p>)}
    </details>
  </section>;
}
