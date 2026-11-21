import type { BattleState } from '../battle/types';
import { MODELS, MOVES } from '../content/core';
import { rosterForProgress, teamCanHandleEncounters } from '../content/team';
import { CAMPAIGN_MISSIONS, getCampaignMission, isMissionUnlocked } from '../content/campaign';
import { CHALLENGES, evaluateChallenge, type ChallengeDefinition } from '../content/challenges';
import { restoreBattleReplay, type BattleReplay } from '../battle/replay';

export interface Progress {
  schema: 4;
  cleared: string[];
  challengesCleared: string[];
  achievements: string[];
  lastReplay: BattleReplay | null;
  missionsCleared: string[];
  teamIds: string[];
  discoveredMoves: string[];
  winsByModel: Record<string,number>;
  useAlternateLoadout: boolean;
}
const OLD_KEY='pokaimon:progress:v1';
const PREVIOUS_KEY='pokaimon:progress:v2';
const THIRD_KEY='pokaimon:progress:v3';
const KEY='pokaimon:progress:v4';
export const defaultProgress: Progress = {
  schema:4, cleared:[], challengesCleared:[], achievements:[], lastReplay:null,
  missionsCleared:[], teamIds:MODELS.slice(0,3).map(model=>model.id),
  discoveredMoves:[], winsByModel:{}, useAlternateLoadout:false,
};

function cleanIds(value:unknown, validIds:readonly string[]):string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id):id is string=>
    typeof id==='string' && validIds.includes(id)))].slice(0,100);
}
function migrate(value:unknown):Progress | null {
  if(!value||typeof value!=='object') return null;
  const object=value as Record<string,unknown>;
  const cleared=cleanIds(object.cleared,[...new Set(['task','bug','research','math','hallucination',
    ...CAMPAIGN_MISSIONS.map(mission=>mission.encounter.id)])]);
  if(object.schema===1) return {...defaultProgress,cleared};
  if(object.schema!==2&&object.schema!==3&&object.schema!==4) return null;
  const discoveredMoves=cleanIds(object.discoveredMoves,Object.keys(MOVES));
  const roster=MODELS.map(m=>m.id);
  const rawTeam=cleanIds(object.teamIds,roster);
  const useAlternateLoadout=object.useAlternateLoadout===true && cleared.length>=3;
  const missionsCleared=cleanIds(object.missionsCleared,CAMPAIGN_MISSIONS.map(mission=>mission.id));
  const challengesCleared=cleanIds(object.challengesCleared,CHALLENGES.map(challenge=>challenge.id));
  const achievements=cleanIds(object.achievements,['first-challenge','combo-master','guard-master','squad-tactician']);
  const lastReplay=object.schema===4 && restoreBattleReplay(object.lastReplay) ? object.lastReplay as BattleReplay : null;
  const provisional:Progress={schema:4,cleared,missionsCleared,challengesCleared,achievements,lastReplay,
    teamIds:rawTeam.length>0&&rawTeam.length<=3?rawTeam:[...roster],
    discoveredMoves, winsByModel:{},useAlternateLoadout};
  if(!teamCanHandleEncounters(rosterForProgress(provisional).filter(m=>provisional.teamIds.includes(m.id))))
    provisional.teamIds=roster.slice(0,3);
  if(object.winsByModel && typeof object.winsByModel==='object'){
    for(const [id,value] of Object.entries(object.winsByModel as Record<string,unknown>)){
      if(roster.includes(id) && typeof value==='number' && Number.isInteger(value) && value>=0)
        provisional.winsByModel[id]=Math.min(value,100);
    }
  }
  return provisional;
}
function parse(key:string):unknown {
  try {return JSON.parse(localStorage.getItem(key)||'null');} catch{return null;}
}
export function loadProgress():Progress {
  try {
    return migrate(parse(KEY)) ?? migrate(parse(THIRD_KEY)) ?? migrate(parse(PREVIOUS_KEY)) ?? migrate(parse(OLD_KEY)) ?? {...defaultProgress,teamIds:[...defaultProgress.teamIds]};
  }catch{return {...defaultProgress,teamIds:[...defaultProgress.teamIds]};}
}
export function saveProgress(progress:Progress):void{
  try {localStorage.setItem(KEY,JSON.stringify(progress));} catch {/* Storage unavailable */ }
}
export function markCleared(progress:Progress,id:string):Progress {
  if(progress.cleared.includes(id))return progress;
  return {...progress,cleared:[...progress.cleared,id]};
}
export function setTeam(progress:Progress,teamIds:readonly string[]):Progress {
  const roster=MODELS.map(m=>m.id);
  if(!teamIds.length||teamIds.length>3||new Set(teamIds).size!==teamIds.length||
     teamIds.some(id=>!roster.includes(id)))return progress;
  const team=rosterForProgress(progress).filter(model=>teamIds.includes(model.id));
  if(!teamCanHandleEncounters(team))return progress;
  return {...progress,teamIds:[...teamIds]};
}
export function setAlternateLoadout(progress:Progress,enabled:boolean):Progress {
  if(progress.cleared.length<3)return progress;
  return {...progress,useAlternateLoadout:enabled};
}
export function recordBattleProgress(progress:Progress,encounterId:string,battle:BattleState):Progress {
  if(battle.outcome==='active'||battle.encounterId!==encounterId)return progress;
  const isNew=battle.outcome==='won'&&!progress.cleared.includes(encounterId);
  const discoveredMoves=[...new Set([
    ...progress.discoveredMoves,
    ...battle.events.filter(e=>e.kind==='MOVE_USED' && !!e.moveId).map(e=>e.moveId!),
  ])];
  const winsByModel={...progress.winsByModel};
  if(isNew){
    const contributors=new Set(battle.events.filter(e=>
      e.kind==='CHARACTER_SELECTED'||e.kind==='MODEL_SWITCHED').map(e=>e.modelId).filter((v):v is string=>!!v));
    if(contributors.size===0) contributors.add(battle.modelId);
    for(const modelId of contributors){
      if(MODELS.some(m=>m.id===modelId)) winsByModel[modelId]=(winsByModel[modelId]??0)+1;
    }
  }
  const cleared=isNew?[...progress.cleared,encounterId]:progress.cleared;
  if(!isNew && discoveredMoves.length===progress.discoveredMoves.length)return progress;
  return {...progress,cleared,discoveredMoves,winsByModel};
}
export function recordMissionVictory(progress:Progress,missionId:string,battle:BattleState):Progress {
  const mission=getCampaignMission(missionId);
  if(!mission || battle.outcome!=='won' || battle.encounterId!==mission.encounter.id ||
     progress.missionsCleared.includes(missionId) ||
     !isMissionUnlocked(missionId,progress.missionsCleared))return progress;
  return {...progress,missionsCleared:[...progress.missionsCleared,missionId]};
}
export function recordBattleReplay(progress:Progress,replay:BattleReplay):Progress {
  if(!restoreBattleReplay(replay))return progress;
  return {...progress,lastReplay:replay};
}
export function recordChallengeCompletion(
  progress:Progress,challenge:ChallengeDefinition,battle:BattleState,replay:BattleReplay|null,
):Progress {
  if(!CHALLENGES.some(known=>known.id===challenge.id) || !evaluateChallenge(challenge,battle))return progress;
  const already=progress.challengesCleared.includes(challenge.id);
  const achievements=[...new Set([
    ...progress.achievements,
    'first-challenge',
    ...(battle.events.some(e=>e.kind==='COMBO_TRIGGERED')?['combo-master']:[]),
    ...(battle.events.some(e=>e.kind==='STATUS_CONSUMED'&&e.message.includes('Guard'))?['guard-master']:[]),
    ...(battle.events.some(e=>e.kind==='MODEL_SWITCHED')?['squad-tactician']:[]),
  ])];
  const nextReplay=replay && restoreBattleReplay(replay) ? replay : progress.lastReplay;
  if(already && achievements.length===progress.achievements.length && nextReplay===progress.lastReplay)return progress;
  return {...progress,
    challengesCleared:already?progress.challengesCleared:[...progress.challengesCleared,challenge.id],
    achievements,lastReplay:nextReplay};
}
export const recordVictory=recordBattleProgress;

export function clearProgress():Progress {
  const progress={...defaultProgress,teamIds:[...defaultProgress.teamIds]};
  saveProgress(progress);
  return progress;
}
