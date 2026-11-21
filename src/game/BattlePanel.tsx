import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { applyMove, createBattle, summarizeBattle, switchModel, totalProgress } from '../battle/engine';
import type { BattleState, EncounterDefinition, ModelDefinition, MoveDefinition } from '../battle/types';
import { MODELS, movesFor } from '../content/core';
import { canUseModel, missingForModel } from '../content/encounters';
import { BattleStage } from './BattleStage';
import { PixelPortrait } from './PixelPortrait';
import { animationDuration, type BattlePhase } from './encounterFlow';
import { playCue } from './sound';
import { setBattleMusic } from './music';
import type { Difficulty } from '../storage/preferences';
import { battleMedal, forecastMove, getStageIntel } from '../battle/tactics';
import { evaluateChallenge, type ChallengeDefinition } from '../content/challenges';

export interface BattlePanelProps {
  encounter: EncounterDefinition;
  roster?: readonly ModelDefinition[];
  nextLabel?: string;
  seed?: number;
  challenge?: ChallengeDefinition;
  reducedMotion: boolean;
  soundEnabled: boolean;
  textSpeed: 'normal' | 'fast';
  difficulty: Difficulty;
  onHome: () => void;
  onNext: () => void;
  onFinish: (id: string, battle: BattleState) => void;
}

interface AttackAction {
  seq: number;
  move: MoveDefinition;
}

export function BattlePanel({
  encounter, roster = MODELS, nextLabel, seed=1, challenge, reducedMotion, soundEnabled, textSpeed, difficulty, onHome, onNext, onFinish,
}: BattlePanelProps) {
  const [phase, setPhase] = useState<BattlePhase>('encounter');
  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [attack, setAttack] = useState<AttackAction | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedMove, setSelectedMove] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [typedFeedback, setTypedFeedback] = useState('');
  const [narration, setNarration] = useState('');
  const selectionButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const moveButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const switchButtons = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => { if (phase === 'result') setBattleMusic(false, false); }, [phase]);

  // Visual phases are never authoritative for battle state.
  useEffect(() => {
    if (phase === 'encounter') {
      const timer = window.setTimeout(() => setPhase('selection'), animationDuration('encounter', reducedMotion));
      return () => window.clearTimeout(timer);
    }
    if (phase === 'throw') {
      const timer = window.setTimeout(() => {
        setPhase('summon');
        playCue('summon', soundEnabled);
      }, animationDuration('throw', reducedMotion));
      return () => window.clearTimeout(timer);
    }
    if (phase === 'summon') {
      const timer = window.setTimeout(() => setPhase('command'), animationDuration('summon', reducedMotion));
      return () => window.clearTimeout(timer);
    }
    if (phase === 'attack' && model && battle && attack) {
      // The impact sound follows the on-screen collision, before damage resolves.
      const impactTimer = window.setTimeout(
        () => playCue('hit', soundEnabled, attack.move.category),
        reducedMotion ? 20 : 350,
      );
      const timer = window.setTimeout(() => {
        const next = applyMove(battle, attack.move.id, model, encounter);
        if(next.events.some(event=>event.turn===next.turn && event.kind==='COMBO_TRIGGERED'))
          playCue('combo',soundEnabled);
        if(next.events.some(event=>event.turn===next.turn && event.kind==='BOSS_PHASE_CHANGED'))
          playCue('boss-phase',soundEnabled);
        setBattle(next);
        setNarration(next.feedback);
        if (next.outcome === 'won' || next.outcome === 'lost') {
          playCue(next.outcome === 'won' ? 'win' : 'lose', soundEnabled);
        }
        setPhase(next.outcome === 'active' ? 'command' : 'result');
      }, animationDuration('attack', reducedMotion));
      return () => {
        window.clearTimeout(impactTimer);
        window.clearTimeout(timer);
      };
    }
  }, [phase, model, battle, attack, encounter, reducedMotion, soundEnabled]);

  useEffect(() => {
    if (phase === 'selection') selectionButtons.current[selectedIndex]?.focus();
    if (phase === 'command') {
      if (switching) switchButtons.current[0]?.focus();
      else moveButtons.current[selectedMove]?.focus();
    }
  }, [phase, switching]);

  useEffect(() => {
    if (battle && battle.outcome !== 'active') onFinish(encounter.id, battle);
  }, [battle?.outcome, encounter.id, onFinish]);

  const currentStage = battle && battle.stageIndex < encounter.stages.length
    ? encounter.stages[battle.stageIndex] : null;
  const bossPhaseEvent = battle?.events.find(event=>event.kind==='BOSS_PHASE_CHANGED');
  const rivalEvent = battle?.events.find(event=>event.turn===battle.turn && event.kind==='RIVAL_ACTED');
  const comboEvent = battle?.events.find(event => event.turn === battle.turn && event.kind === 'COMBO_TRIGGERED');
  const counterEvent = battle?.events.find(event =>
    event.turn === battle.turn && event.kind === 'ENEMY_ACTED' &&
    event.message.includes(' used '));

  const message = (phase === 'encounter' || phase === 'selection')
    ? 'A wild ' + encounter.name + ' appeared!'
    : (phase === 'throw' || phase === 'summon')
      ? 'Go! ' + (model?.displayName ?? 'AI') + '!'
      : phase === 'attack' ? (model?.displayName ?? 'AI') + ' used ' + attack?.move.name + '!'
      : phase === 'result' && battle?.outcome === 'won' ? encounter.name + ' completed!'
      : phase === 'result' ? 'Your team ran out of moves!'
      : phase === 'command' && switching ? 'Choose a companion. Switching uses one turn and no AP.'
      : phase === 'command' && counterEvent ? (counterEvent.message.includes('blocked') ? 'Guard blocked ' + encounter.special + '!' : 'The problem changed. Choose your response.')
      : phase === 'command' && currentStage ? (difficulty === 'hard' ? 'Choose your next move.' : 'Choose a move for ' + currentStage.label + '.')
      : narration || 'What should ' + (model?.displayName ?? 'your AI') + ' do?';

  useEffect(() => {
    if (reducedMotion || textSpeed === 'fast' || phase === 'result' || phase === 'command') {
      setTypedFeedback(message);
      return;
    }
    let count = 0;
    setTypedFeedback('');
    const timer = window.setInterval(() => {
      count = Math.min(message.length, count + 3);
      setTypedFeedback(message.slice(0, count));
      if (count % 15 === 0 && count < message.length) playCue('text', soundEnabled);
      if (count >= message.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [message, reducedMotion, textSpeed, soundEnabled, phase]);

  function selectModel(next: ModelDefinition): void {
    if (phase !== 'selection') return;
    playCue('throw', soundEnabled);
    setModel(next);
    setBattle(createBattle(encounter, next, seed, roster));
    setSelectedMove(0);
    setSwitching(false);
    setAttack(null);
    setNarration('');
    setPhase('throw');
  }

  function useMove(move: MoveDefinition): void {
    if (phase !== 'command' || switching || !model || !battle || battle.outcome !== 'active' || battle.ap < move.cost) return;
    playCue('attack', soundEnabled, move.category);
    setAttack(old => ({ seq: (old?.seq ?? 0) + 1, move }));
    setPhase('attack');
  }

  function changeCompanion(nextModel: ModelDefinition): void {
    if (phase !== 'command' || !switching || !battle || !model) return;
    const next = switchModel(battle, nextModel.id, encounter, roster);
    if (next === battle) return;
    playCue('summon', soundEnabled);
    setBattle(next);
    setModel(nextModel);
    setSelectedMove(0);
    setSwitching(false);
    setNarration(next.feedback);
    if (next.outcome !== 'active') playCue('lose', soundEnabled);
    setPhase(next.outcome === 'active' ? 'summon' : 'result');
  }

  function retry(): void {
    setPhase('encounter');
    setModel(null);
    setBattle(null);
    setAttack(null);
    setSelectedIndex(0);
    setSelectedMove(0);
    setSwitching(false);
    setTypedFeedback('');
    setNarration('');
    playCue('encounter', soundEnabled);
    setBattleMusic(true, soundEnabled);
  }

  function onSelectionKey(event: KeyboardEvent<HTMLDivElement>): void {
    if (phase !== 'selection') return;
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'w', 's'].includes(key)) {
      event.preventDefault();
      const shift = key === 'arrowup' || key === 'w' ? -1 : 1;
      const index = (selectedIndex + shift + roster.length) % roster.length;
      setSelectedIndex(index);
      selectionButtons.current[index]?.focus();
      playCue('select', soundEnabled);
    }
  }

  function onMovesKey(event: KeyboardEvent<HTMLDivElement>): void {
    if (switching) return;
    const key = event.key.toLowerCase();
    const vertical = ['arrowup', 'arrowdown', 'w', 's'].includes(key);
    const horizontal = ['arrowleft', 'arrowright', 'a', 'd'].includes(key);
    if (!vertical && !horizontal) return;
    event.preventDefault();
    const current = moveButtons.current.findIndex(el => el === document.activeElement);
    const index = current >= 0 ? current : 0;
    const next = vertical ? (index + 2) % 4 : index ^ 1;
    setSelectedMove(next);
    moveButtons.current[next]?.focus();
    playCue('select', soundEnabled);
  }

  const hp = 100 - (battle ? totalProgress(battle) : 0);
  const showHero = ['summon', 'command', 'attack', 'result'].includes(phase);
  const moves = model ? movesFor(model) : [];
  const intel = battle ? getStageIntel(battle, encounter) : null;
  const forecasts = battle ? moves.map(move => forecastMove(battle, move, encounter)) : [];
  const companions = battle ? roster.filter(companion => battle.squadIds.includes(companion.id) && companion.id !== model?.id) : [];

  return <section className="retro-battle" aria-label={'Wild ' + encounter.name + ' encounter'}>
    <div className="retro-topbar">
      <button className="retro-back" onClick={onHome}>◀ HOME</button>
      <span className="battle-chapter">{challenge ? 'CHALLENGE BATTLE' : 'WILD ENCOUNTER'} <span aria-hidden="true">✦</span></span>
      <small>SIMULATION</small>
    </div>

    {challenge && <div className="challenge-objective" role="status">{challenge.title.toUpperCase()} · {challenge.tier.toUpperCase()}</div>}
    <div className="game-frame">
      <div className="battle-screen">
        <BattleStage enemy={encounter.name} model={model?.id ?? null} phase={phase}
          bossSequence={bossPhaseEvent?1:0} comboSequence={comboEvent?.seq ?? 0}
          attackSequence={attack?.seq ?? 0} attackType={attack?.move.category ?? ''}
          outcome={battle?.outcome ?? 'active'} reducedMotion={reducedMotion} />
        <div className="enemy-status status-frame" aria-label={'Wild ' + encounter.name + ' status'}>
          <div className="status-heading"><strong>{encounter.name}</strong><b>Lv.{encounter.level}</b></div>
          <div className="status-hp"><b>HP</b><div className="classic-hp" role="meter" aria-label="Wild problem HP"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={hp}>
            <span className={hp <= 25 ? 'hp-red' : hp <= 50 ? 'hp-yellow' : 'hp-green'}
              style={{ width: hp + '%' }} />
          </div></div>
        </div>
        {showHero && model && <div className="hero-status status-frame">
          <div className="status-heading"><strong>{model.displayName}</strong><b>Lv.50</b></div>
          <div className="status-hp"><b>AP</b><div className="classic-hp" role="meter" aria-label="AI action points"
            aria-valuemin={0} aria-valuemax={battle?.maxAp ?? 6} aria-valuenow={battle?.ap ?? 6}>
            <span style={{ width: ((battle?.ap ?? 6) / (battle?.maxAp ?? 6) * 100) + '%' }} />
          </div><small>{battle?.ap ?? 6}/{battle?.maxAp ?? 6}</small></div>
        </div>}
        {phase === 'encounter' && <div className="encounter-flash" aria-hidden="true" />}
      </div>

      <div className="retro-dialogue pixel-box">
        <p aria-hidden="true">{typedFeedback}<span className="dialogue-caret" aria-hidden="true">▾</span></p>
        <span className="sr-only" role="status" aria-live="polite">{message}</span>
        {phase === 'command' && currentStage && <small className="stage-intel"><b>STEP {intel?.number}/{intel?.count}</b>{' · '}{currentStage.label}{difficulty === 'easy' ? ' · ' + currentStage.hint : ''}</small>}
        {phase === 'result' && battle && <small>{battle.outcome === 'won'
          ? 'All ' + encounter.stages.length + ' steps complete. Ready for another wild problem?'
          : 'That approach ran out of AP. Review the unfinished step and retry.'}</small>}
        {(phase === 'encounter' || phase === 'selection') &&
          <small>Choose a companion to face this wild problem.</small>}
      </div>

      {phase === 'selection' && <div className="retro-menu party-panel" onKeyDown={onSelectionKey}
        aria-label="AI model selection">
        {roster.map((m, index) => {
          const viable = canUseModel(encounter, m);
          return <button key={m.id} ref={node => { selectionButtons.current[index] = node; }}
            className={'party-slot ' + (selectedIndex === index ? 'is-selected' : '')}
            aria-label={'Select ' + m.displayName} onFocus={() => setSelectedIndex(index)}
            onClick={() => selectModel(m)}>
            <span className="party-cursor" aria-hidden="true">{selectedIndex === index ? '▶' : ''}</span>
            <span className={'party-avatar party-' + m.id} aria-hidden="true">
              <PixelPortrait model={m.id} />
            </span>
            <span className="party-details">
              <strong>{m.displayName}</strong>
              <small>{m.provider.toUpperCase()} · {difficulty === 'easy' ? (viable ? 'READY TO BATTLE' : 'DIFFICULT MATCHUP') : 'CHOOSE YOUR COMPANION'}</small>
              {difficulty === 'easy' && !viable && <span className="party-warning">NEEDS {missingForModel(encounter, m).join(', ')}</span>}
              <span className="party-ap" aria-hidden="true"><span /></span>
            </span>
            <b className="party-level">Lv.50</b>
          </button>;
        })}
        <div className="retro-help">▲ ▼ SELECT <span>ENTER / TAP CONFIRM</span></div>
      </div>}

      {phase === 'command' && <div className="command-panel">
        <div className="command-header"><span>{switching ? 'CHOOSE COMPANION' : model?.displayName.toUpperCase()}</span>
          <button className="squad-action" onClick={() => setSwitching(old => !old)} aria-expanded={switching}>{switching ? '◀ MOVES' : '↺ SWITCH (1 TURN)'}</button>
          <span>TURN {battle?.turn ?? 0}</span></div>
        {switching ? <div id="switch-options" className="squad-options" role="group" aria-label="Switch companion">
          {companions.map((companion, index) => <button key={companion.id}
            ref={node => { switchButtons.current[index] = node; }}
            onClick={() => changeCompanion(companion)} aria-label={'Switch to ' + companion.displayName}>
            <span className="squad-icon" aria-hidden="true"><PixelPortrait model={companion.id} /></span>
            <span><b>{companion.displayName}</b><small>0 AP · 1 TURN</small></span>
          </button>)}
        </div> : <><div className="command-grid" onKeyDown={onMovesKey} aria-label="Move selection">
          {moves.map((move, i) => <button key={move.id}
            ref={node => { moveButtons.current[i] = node; }}
            className={'retro-move ' + (selectedMove === i ? 'is-selected' : '') +
              (difficulty === 'easy' ? (forecasts[i]?.status === 'effective' ? ' is-effective' : ' is-mismatch') : '')}
            onFocus={() => setSelectedMove(i)}
            onClick={() => useMove(move)} disabled={!battle || battle.ap < move.cost}
            aria-label={move.name} title={difficulty === 'easy' ? move.description + ' ' + move.lesson : undefined}>
            <span className="retro-arrow" aria-hidden="true">▶</span>
            <span className="move-copy"><strong>{move.name}</strong><small>{move.category.toUpperCase()} · {move.cost} AP
              {difficulty === 'easy' && <b className={'move-forecast ' + (forecasts[i]?.status === 'effective' ? 'fits' : 'misses')}
                aria-hidden="true">{forecasts[i]?.status === 'effective' ? '+' + forecasts[i].gain : '×'}</b>}
            </small></span>
          </button>)}
        </div>
        </>}
        {encounter.rival && !rivalEvent && <div className="rival-intent" role="status">RIVAL · {encounter.rival.name.toUpperCase()}: {difficulty === 'hard' ? 'Watch their tactics.' : 'Repeating the same approach makes the next step harder.'}</div>}
        {encounter.boss && <div className="boss-intent" role="status">
          {battle?.bossPhaseTriggered ? '★ BOSS PHASE: '+encounter.boss.label : 'BOSS BATTLE · '+(difficulty==='hard'?'A change is coming.':'Prepare for a '+encounter.boss.effect+' phase.')}
        </div>}
        {rivalEvent && <div className="wild-counter rival-counter" role="status">{rivalEvent.message}</div>}
        {intel?.incomingSpecial && <div className="battle-intent" role="status">
          {difficulty === 'hard' ? encounter.name + ' is preparing an action.' : encounter.name + ' prepares ' + intel.incomingSpecial + '.'}
          {battle?.guarded && <b> · GUARD READY</b>}
        </div>}
        {counterEvent && <div className="wild-counter" role="status" aria-live="polite">
          <b>{counterEvent.message}</b>
        </div>}
        {!switching && difficulty !== 'hard' && <div className="move-lesson" role="status" aria-live="polite">
          <b>{moves[selectedMove]?.name}:</b>{' '}{moves[selectedMove]?.description}{' '}
          {difficulty === 'easy' && <span>{forecasts[selectedMove]?.status === 'effective'
            ? 'Fits this step (simulated +' + forecasts[selectedMove].gain + ').'
            : 'No progress on this step.'}{moves[selectedMove]?.tacticalEffect === 'guard' ? ' Can block an incoming counter.' : ''}</span>}
        </div>}
        {!switching && difficulty === 'easy' && !intel?.incomingSpecial && <div className="retro-help tactical-help">{intel?.incomingSpecial
          ? 'WILD COUNTER NEXT: ' + intel.incomingSpecial.toUpperCase()
          : 'MATCH MOVE TYPE TO THE CURRENT STEP'}</div>}
      </div>}

      {phase === 'attack' && <div className="action-wait" role="status">ATTACKING<span className="blink">▾</span></div>}
      {(phase === 'throw' || phase === 'summon') &&
        <div className="action-wait">SUMMONING {model?.displayName.toUpperCase()}<span className="blink">▾</span></div>}

      {phase === 'result' && battle && <div className="retro-result">
        <h2>{battle.outcome === 'won' ? 'VICTORY!' : 'TRY AGAIN'}</h2>
        {challenge&&<div className={'challenge-result '+(evaluateChallenge(challenge,battle)?'challenge-success':'challenge-failed')}>
          {evaluateChallenge(challenge,battle)?'★ CHALLENGE CLEAR · '+challenge.title.toUpperCase():
            battle.outcome==='won'?'TASK COMPLETED · CHALLENGE OBJECTIVE MISSED':'CHALLENGE FAILED · RETRY WITH A NEW STRATEGY'}
        </div>}
        {battle.events.some(event => event.kind === 'COMBO_TRIGGERED') && <div className="battle-combo" role="status">EVIDENCE COMBO · RESEARCH + VERIFY</div>}
        {battleMedal(battle) && <div className="battle-medal" role="status"><b>{battleMedal(battle)}</b>
          <span>{battle.turn} TURNS · {battle.maxAp - battle.ap} AP USED</span></div>}
        <p>{summarizeBattle(battle, encounter)}</p>
        {comboEvent && <span className="sr-only">{comboEvent.message}</span>}
        {encounter.boss && <p className="boss-result">{bossPhaseEvent?'BOSS PHASE OVERCOME: '+encounter.boss.label:'BOSS CHALLENGE'}</p>}
        <div className="result-buttons">
          <button onClick={retry}>↻ RETRY BATTLE</button>
          <button onClick={onNext}>{nextLabel ?? '▶ NEXT WILD ENCOUNTER'}</button>
        </div>
        <details className="battle-log">
          <summary>BATTLE LOG ({battle.events.length})</summary>
          {battle.events.slice(-9).map(event => <p key={event.seq}><b>#{event.turn}</b> {event.message}</p>)}
        </details>
      </div>}
    </div>

    <p className="retro-footnote">SIMULATED BATTLE · REAL AI METHODS · ORIGINAL GAME ART</p>
  </section>;
}
