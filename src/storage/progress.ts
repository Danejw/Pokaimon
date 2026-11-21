import type { BattleState } from '../battle/types';
import { MODELS, MOVES } from '../content/core';
import { rosterForProgress, teamCanHandleEncounters } from '../content/team';

export interface Progress {
  schema: 2;
  cleared: string[];
  teamIds: string[];
  discoveredMoves: string[];
  winsByModel: Record<string,number>;
  useAlternateLoadout: boolean;
}
const OLD_KEY='pokaimon:progress:v1';
const KEY='pokaimon:progress:v2';
export const defaultProgress: Progress = {
  schema:2, cleared:[], teamIds:MODELS.map(model=>model.id),
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
  const cleared=cleanIds(object.cleared,['task','bug','research','math','hallucination']);
  if(object.schema===1) return {...defaultProgress,cleared};
  if(object.schema!==2) return null;
  const discoveredMoves=cleanIds(object.discoveredMoves,Object.keys(MOVES));
  const roster=MODELS.map(m=>m.id);
  const rawTeam=cleanIds(object.teamIds,roster);
  const useAlternateLoadout=object.useAlternateLoadout===true && cleared.length>=3;
  const provisional:Progress={schema:2,cleared,
    teamIds:rawTeam.length>0&&rawTeam.length<=3?rawTeam:[...roster],
    discoveredMoves, winsByModel:{},useAlternateLoadout};
  if(!teamCanHandleEncounters(rosterForProgress(provisional).filter(m=>provisional.teamIds.includes(m.id))))
    provisional.teamIds=[...roster];
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
    return migrate(parse(KEY)) ?? migrate(parse(OLD_KEY)) ?? {...defaultProgress,teamIds:[...defaultProgress.teamIds]};
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
export const recordVictory=recordBattleProgress;

export function clearProgress():Progress {
  const progress={...defaultProgress,teamIds:[...defaultProgress.teamIds]};
  saveProgress(progress);
  return progress;
}
