import { describe, expect, it, vi } from 'vitest';
import { applyMove, createBattle } from '../src/battle/engine';
import { INITIAL_MODEL, MODELS } from '../src/content/core';
import { rosterForProgress, teamCanHandleEncounters } from '../src/content/team';
import { defaultProgress, loadProgress, saveProgress, markCleared, recordVictory, setTeam, setAlternateLoadout } from '../src/storage/progress';

function stubStorage(initial:Record<string,string>={}) {
  const data = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage',{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value)});
  return data;
}

describe('model collection, team and versioned progress', () => {
  it('creates a usable squad of the three starter models on a fresh device',()=>{
    stubStorage();
    const p=loadProgress();
    expect(p.schema).toBe(2);
    expect(p.teamIds).toEqual(MODELS.map(model=>model.id));
    expect(rosterForProgress(p).length).toBe(3);
    vi.unstubAllGlobals();
  });
  it('migrates older cleared tasks once without erasing them',()=>{
    const data=stubStorage({'pokaimon:progress:v1':JSON.stringify({schema:1,cleared:['task','bug','task']})});
    const p=loadProgress();
    expect(p.cleared).toEqual(['task','bug']);
    expect(p.teamIds).toEqual(MODELS.map(m=>m.id));
    saveProgress(p);
    expect(JSON.parse(data.get('pokaimon:progress:v2')??'{}').schema).toBe(2);
    expect(loadProgress()).toEqual(p);
    vi.unstubAllGlobals();
  });
  it('rejects invalid saved team IDs and corrupt saves safely',()=>{
    stubStorage({'pokaimon:progress:v2':JSON.stringify({schema:2,cleared:['task'],teamIds:['unknown','grok'],discoveredMoves:['bad'],winsByModel:{},useAlternateLoadout:true})});
    const p=loadProgress();
    expect(teamCanHandleEncounters(rosterForProgress(p))).toBe(true);
    expect(p.teamIds).toEqual(MODELS.map(m=>m.id));
    expect(p.useAlternateLoadout).toBe(false);
    vi.unstubAllGlobals();
  });
  it('permits viable squad changes while rejecting softlocked teams and duplicates',()=>{
    const p={...defaultProgress};
    expect(teamCanHandleEncounters([INITIAL_MODEL])).toBe(true);
    expect(teamCanHandleEncounters([MODELS[1]])).toBe(false);
    const astra=setTeam(p,['astra']);
    expect(astra.teamIds).toEqual(['astra']);
    expect(setTeam(p,['grok']).teamIds).toEqual(p.teamIds);
    expect(setTeam(p,['astra','astra']).teamIds).toEqual(p.teamIds);
    expect(setTeam(p,[]).teamIds).toEqual(p.teamIds);
  });
  it('discovers moves from real reducer events and unlocks a meaningful alternate loadout after 3 unique clears',()=>{
    let battle=createBattle();
    for(const id of ['deep-think','code-execution','self-correction','self-correction']) battle=applyMove(battle,id);
    expect(battle.outcome).toBe('won');
    const first=recordVictory(defaultProgress,'task',battle);
    expect(first.discoveredMoves).toContain('deep-think');
    expect(first.winsByModel.astra).toBe(1);
    expect(recordVictory(first,'task',battle).winsByModel.astra).toBe(1);
    const three=markCleared(markCleared(first,'bug'),'research');
    expect(three.cleared).toHaveLength(3);
    const equipped=setAlternateLoadout(three,true);
    expect(equipped.useAlternateLoadout).toBe(true);
    expect(rosterForProgress(equipped).find(x=>x.id==='astra')!.moveIds).toContain('code-review');
    expect(rosterForProgress(equipped).find(x=>x.id==='astra')!.moveIds).not.toContain('code-execution');
  });
});
