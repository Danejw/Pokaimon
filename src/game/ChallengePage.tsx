import { useState } from 'react';
import { CHALLENGES } from '../content/challenges';
import { decodeChallengeCode, encodeChallengeCode, type ScenarioCode } from '../content/variants';
import { restoreBattleReplay } from '../battle/replay';
import type { Progress } from '../storage/progress';

export function ChallengePage({progress,onHome,onLaunch}:{
  progress:Progress;
  onHome:()=>void;
  onLaunch:(scenario:ScenarioCode,challengeId:string|null)=>void;
}) {
  const [code,setCode]=useState('');
  const [notice,setNotice]=useState('');
  const last=progress.lastReplay?restoreBattleReplay(progress.lastReplay):null;
  async function copyCode(value:string) {
    if(typeof navigator.clipboard?.writeText!=='function'){
      setNotice('Select the challenge code and copy it manually.');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Code copied.');
    } catch {
      setNotice('Clipboard unavailable. Select the code to copy manually.');
    }
  }
  return <section className="challenges-page retro-page">
    <div className="section-top"><button className="back-button" onClick={onHome}>◀ HOME</button><span>CHALLENGES</span></div>
    <h2>Battle Challenges</h2>
    <p className="intro">A new challenge for your models. Match techniques, build combos, and discover strategic ways to win.</p>
    <p className="challenge-achievements" role="status">{progress.challengesCleared.length}/{CHALLENGES.length} CHALLENGES CLEARED · {progress.achievements.length} BADGES EARNED</p>
    <article className="intelligence-trial">
      <div className="challenge-heading"><span>★ Hallucination Hydra</span><small>NEW TRIAL</small></div>
      <p>A confident claim hides duplicate sources. Inspect the evidence or try to push through its Echo Chamber.</p>
      <div className="challenge-actions">
        <span>DECISION-DRIVEN BOSS</span>
        <button className="primary" onClick={()=>onLaunch({encounterId:'hydra',seed:601,modifierIds:[]},null)}>▶ HYDRA TRIAL</button>
      </div>
    </article>
    <article className="intelligence-trial">
      <div className="challenge-heading"><span>★ Regression Golem</span><small>NEW TRIAL</small></div>
      <p>Debug an unstable app. Diagnose the root cause first, or repair and test the unexpected regression.</p>
      <div className="challenge-actions"><span>DEBUGGING BOSS</span>
        <button className="primary" onClick={()=>onLaunch({encounterId:'golem',seed:602,modifierIds:[]},null)}>▶ GOLEM TRIAL</button>
      </div>
    </article>
    <article className="intelligence-trial">
      <div className="challenge-heading"><span>★ Scope Shifter</span><small>NEW TRIAL</small></div>
      <p>Clarify the requirements before committing, or pay to revise the plan after the brief changes.</p>
      <div className="challenge-actions"><span>PLANNING BOSS</span>
        <button className="primary" onClick={()=>onLaunch({encounterId:'scope-shifter',seed:603,modifierIds:[]},null)}>▶ SCOPE TRIAL</button>
      </div>
    </article>
    {CHALLENGES.map((challenge,index)=>{
      const scenario={encounterId:challenge.encounterId,seed:challenge.seed,modifierIds:[...challenge.modifierIds]};
      const share=encodeChallengeCode(scenario);
      return <article className="challenge-card" key={challenge.id}>
        <div className="challenge-heading"><span>{index+1}. {challenge.title}</span><small>{challenge.tier.toUpperCase()}</small></div>
        <p>{challenge.tagline}</p>
        <div className="challenge-code-row">
          <input readOnly aria-label={challenge.title+' challenge code'} value={share} onFocus={event=>event.target.select()}/>
          <button onClick={()=>void copyCode(share)}>COPY</button>
        </div>
        <div className="challenge-actions">
          <span>{progress.challengesCleared.includes(challenge.id)?'★ CLEARED':'UNDISCOVERED'}</span>
          <button className="primary" onClick={()=>onLaunch(scenario,challenge.id)}>▶ BATTLE</button>
        </div>
      </article>;
    })}
    <div className="challenge-import">
      <h3>REPLAY A CHALLENGE CODE</h3>
      <label htmlFor="challenge-import-input">Paste a PK1 code to replay a challenge.</label>
      <div className="challenge-code-row">
        <input id="challenge-import-input" aria-label="Paste challenge code" value={code} maxLength={90} onChange={event=>setCode(event.target.value)}/>
        <button onClick={()=>{
          const parsed=decodeChallengeCode(code);
          if(!parsed){setNotice('Invalid or unsupported challenge code.');return;}
          const known=CHALLENGES.find(challenge=>encodeChallengeCode({
            encounterId:challenge.encounterId,seed:challenge.seed,modifierIds:[...challenge.modifierIds],
          })===code);
          onLaunch(parsed,known?.id??null);
        }}>PLAY CODE</button>
      </div>
      {notice && <p role="status" className={notice === 'Code copied.' ? 'sr-only' : undefined}>{notice}</p>}
    </div>
    {last&&<details className="challenge-replay">
      <summary>LAST BATTLE REPLAY · {last.outcome.toUpperCase()} · {last.turn} TURNS</summary>
      <ol>{last.events.filter(event=>event.kind==='MOVE_USED'||event.kind==='MODEL_SWITCHED')
        .map(event=><li key={event.seq}>{event.message}</li>)}</ol>
    </details>}
    {progress.achievements.length>0&&<section className="challenge-emblems">
      <h3>YOUR BADGES</h3>
      {progress.achievements.map(id=><span key={id}>★ {id.replaceAll('-',' ').toUpperCase()}</span>)}
    </section>}
  </section>;
}
