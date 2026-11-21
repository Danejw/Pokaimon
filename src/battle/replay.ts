import { applyMove, createBattle, switchModel } from './engine';
import type { BattleState, ModelDefinition } from './types';
import { MODELS, MOVES } from '../content/core';
import { makeEncounter, type ModifierId } from '../content/variants';

export const REPLAY_CONTENT_VERSION=1;
export type ReplayAction = {kind:'move'|'switch';id:string};
export interface BattleReplay {
  formatVersion:1;
  contentVersion:number;
  encounterId:string;
  seed:number;
  modifierIds:ModifierId[];
  initialModelId:string;
  roster: {id:string;moveIds:string[]}[];
  actions:ReplayAction[];
  checksum:string;
}

function fingerprint(state:BattleState):string {
  // Deterministic 32-bit FNV-1a over authoritative game state. Not a security signature.
  const raw=JSON.stringify(state);
  let hash=0x811c9dc5;
  for(let i=0;i<raw.length;i++){
    hash=Math.imul(hash ^ raw.charCodeAt(i),0x01000193);
  }
  return (hash>>>0).toString(16).padStart(8,'0');
}

export function buildBattleReplay(
  battle:BattleState, context:{
    encounterId:string;
    modifierIds:readonly ModifierId[];
    roster:readonly ModelDefinition[];
  },
):BattleReplay {
  const actions:ReplayAction[]=battle.events.filter(event=>
    event.kind==='MOVE_USED'||event.kind==='MODEL_SWITCHED').map(event=>
    event.kind==='MOVE_USED'
      ? {kind:'move',id:event.moveId??''}
      : {kind:'switch',id:event.modelId??''}
  );
  const initialModelId=battle.events.find(e=>e.kind==='CHARACTER_SELECTED')?.modelId??battle.modelId;
  return {
    formatVersion:1,contentVersion:REPLAY_CONTENT_VERSION,
    encounterId:context.encounterId,seed:battle.seed,
    modifierIds:[...context.modifierIds],initialModelId,
    roster:context.roster.map(model=>({id:model.id,moveIds:[...model.moveIds]})),
    actions,checksum:fingerprint(battle),
  };
}

export function restoreBattleReplay(raw:unknown):BattleState|null {
  if(!raw||typeof raw!=='object'||JSON.stringify(raw).length>5000)return null;
  const replay=raw as Record<string,unknown>;
  if(replay.formatVersion!==1||replay.contentVersion!==REPLAY_CONTENT_VERSION||
     typeof replay.encounterId!=='string' || typeof replay.seed!=='number'||
     typeof replay.initialModelId!=='string'||typeof replay.checksum!=='string'||
     !Array.isArray(replay.modifierIds)||!Array.isArray(replay.roster)||
     !Array.isArray(replay.actions)||replay.actions.length>8||replay.roster.length>3||
     replay.roster.length<1)return null;
  const modifierIds=replay.modifierIds as ModifierId[];
  const encounter=makeEncounter(replay.encounterId,replay.seed,modifierIds);
  if(!encounter)return null;
  const roster:ModelDefinition[]=[];
  for(const entry of replay.roster){
    if(!entry||typeof entry!=='object')return null;
    const id=(entry as {id?:unknown}).id;
    const ids=(entry as {moveIds?:unknown}).moveIds;
    if(typeof id!=='string'||!Array.isArray(ids)||ids.length!==4||
       !ids.every(moveId=>typeof moveId==='string' && moveId in MOVES)||
       roster.some(model=>model.id===id))return null;
    const base=MODELS.find(model=>model.id===id);
    if(!base)return null;
    roster.push({...base,moveIds:ids as [string,string,string,string]});
  }
  const initial=roster.find(model=>model.id===replay.initialModelId);
  if(!initial)return null;
  let state=createBattle(encounter,initial,replay.seed,roster);
  for(const action of replay.actions){
    if(!action||typeof action!=='object'||(action.kind!=='move'&&action.kind!=='switch')||
       typeof action.id!=='string'||action.id.length>50)return null;
    const active=roster.find(model=>model.id===state.modelId);
    if(!active)return null;
    const next=action.kind==='move'
      ? applyMove(state,action.id,active,encounter)
      : switchModel(state,action.id,encounter,roster);
    if(next===state)return null;
    state=next;
  }
  return fingerprint(state)===replay.checksum?state:null;
}
