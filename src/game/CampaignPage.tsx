import { CAMPAIGN_CHAPTERS, getCampaignMission, isChapterComplete, isMissionUnlocked, type CampaignMission } from '../content/campaign';
import type { Progress } from '../storage/progress';

export function CampaignPage({progress,onHome,onLaunch}:{
  progress:Progress;onHome:()=>void;onLaunch:(mission:CampaignMission)=>void;
}) {
  const cleared=progress.missionsCleared;
  return <section className="campaign-page retro-page">
    <div className="section-top"><button className="back-button" onClick={onHome}>◀ HOME</button><span>CAMPAIGN</span></div>
    <h2>Trainer campaign</h2>
    <p className="intro">Three chapters. Nine missions. Learn to build reliable AI workflows by defeating original wild tasks, rivals and bosses.</p>
    <div className="campaign-progress" role="status">{cleared.length}/9 MISSIONS CLEARED · SAVED LOCALLY</div>
    {CAMPAIGN_CHAPTERS.map((chapter,index)=><section className="campaign-chapter" key={chapter.id}>
      <div className="campaign-chapter-heading">
        <h3>CHAPTER {index+1}: {chapter.title.toUpperCase()}</h3>
        <span>{isChapterComplete(chapter,cleared)?'★ CHAPTER CLEAR':chapter.tagline}</span>
      </div>
      {chapter.missionIds.map((id,missionIndex)=>{
        const mission=getCampaignMission(id)!;
        const isCleared=cleared.includes(id);
        const unlocked=isMissionUnlocked(id,cleared);
        return <button key={id} className={'campaign-mission '+(unlocked?'available':'locked')} 
          disabled={!unlocked} onClick={()=>onLaunch(mission)}>
          <span className="campaign-step-num">{index+1}-{missionIndex+1}</span>
          <span className="campaign-copy">
            <strong>{mission.title}</strong>
            <small>{mission.kind==='boss'?'BOSS BATTLE':mission.kind==='rival'?'RIVAL BATTLE':'WILD ENCOUNTER'} · {mission.briefing}</small>
          </span>
          <b>{isCleared?'✓ CLEAR':unlocked?'▶ PLAY':'LOCKED'}</b>
        </button>;
      })}
      {isChapterComplete(chapter,cleared)&&
        <p className="chapter-award">★ {chapter.title.toUpperCase()} EMBLEM EARNED</p>}
    </section>)}
  </section>;
}
