import { describe, expect, it, vi } from 'vitest';
import { applyMove, createBattle } from '../src/battle/engine';
import { INITIAL_MODEL, MODELS } from '../src/content/core';
import { CAMPAIGN_CHAPTERS, CAMPAIGN_MISSIONS, getCampaignMission, isMissionUnlocked } from '../src/content/campaign';
import { defaultProgress, loadProgress, recordMissionVictory, saveProgress } from '../src/storage/progress';

describe('three-chapter campaign and rival bosses', () => {
  it('contains three serial chapters, each with a real mission, rival and unique boss',()=>{
    expect(CAMPAIGN_CHAPTERS).toHaveLength(3);
    expect(CAMPAIGN_MISSIONS).toHaveLength(9);
    expect(new Set(CAMPAIGN_MISSIONS.map(m=>m.id)).size).toBe(9);
    expect(CAMPAIGN_MISSIONS.filter(m=>m.kind==='boss')).toHaveLength(3);
    expect(CAMPAIGN_MISSIONS.filter(m=>m.kind==='rival')).toHaveLength(3);
    for(const mission of CAMPAIGN_MISSIONS) {
      expect(mission.encounter.stages).toHaveLength(3);
      expect(mission.encounter.lesson).not.toBe('');
    }
  });
  it('starts at the first mission and unlocks the next only after its verified victory',()=>{
    const [first,second,third]=CAMPAIGN_MISSIONS;
    expect(isMissionUnlocked(first.id,[])).toBe(true);
    expect(isMissionUnlocked(second.id,[])).toBe(false);
    const failed={...createBattle(first.encounter,INITIAL_MODEL),outcome:'lost' as const};
    expect(recordMissionVictory(defaultProgress, first.id, failed)).toBe(defaultProgress);
    let victory=createBattle(first.encounter,INITIAL_MODEL);
    for(const move of ['deep-think','code-execution','self-correction','self-correction'])
      victory=applyMove(victory,move,INITIAL_MODEL,first.encounter);
    expect(victory.outcome).toBe('won');
    const saved=recordMissionVictory(defaultProgress,first.id,victory);
    expect(saved.missionsCleared).toEqual([first.id]);
    expect(isMissionUnlocked(second.id,saved.missionsCleared)).toBe(true);
    expect(isMissionUnlocked(third.id,saved.missionsCleared)).toBe(false);
    expect(recordMissionVictory(saved,first.id,victory)).toBe(saved);
  });
  it('every boss changes phase only once and has distinct behavior',()=>{
    const bosses=CAMPAIGN_MISSIONS.filter(m=>m.kind==='boss');
    expect(new Set(bosses.map(m=>m.encounter.boss?.effect)).size).toBe(3);
    for(const mission of bosses) {
      const model=INITIAL_MODEL;
      let state=createBattle(mission.encounter,model);
      const moves=mission.encounter.stages.map(stage=>
        stage.accepts.includes('coding')?'code-execution':
        stage.accepts.includes('research')?'deep-research':
        stage.accepts.includes('reasoning')?'deep-think':'self-correction');
      for(const move of moves) {
        if(state.outcome!=='active') break;
        state=applyMove(state,move,model,mission.encounter);
      }
      expect(state.events.filter(e=>e.kind==='BOSS_PHASE_CHANGED').length,mission.id).toBeLessThanOrEqual(1);
      expect(state.goals.every(goal=>goal>0 && goal<=120)).toBe(true);
    }
  });
  it('an original rival discourages repeating a matching capability in adjacent stages',()=>{
    const rival=CAMPAIGN_MISSIONS.find(m=>m.kind==='rival')!;
    const grok=MODELS[1];
    let state=createBattle(rival.encounter,grok);
    state=applyMove(state,'max-reasoning',grok,rival.encounter);
    const originalGoal=state.goals[state.stageIndex];
    const repeat=applyMove(state,'max-reasoning',grok,rival.encounter);
    expect(repeat.events.some(e=>e.kind==='RIVAL_ACTED')).toBe(true);
    expect(repeat.goals[1]).toBe(originalGoal+rival.encounter.rival!.repeatPenalty);
    const alternate=applyMove(state,'context-recall',grok,rival.encounter);
    expect(alternate.events.some(e=>e.kind==='RIVAL_ACTED')).toBe(false);
  });
  it('migrates v2 saves to v3 without losing team or mastery',()=>{
    const data=new Map([['pokaimon:progress:v2',JSON.stringify({
      schema:2,cleared:['task','bug','research'],teamIds:['astra'],
      discoveredMoves:['deep-think'],winsByModel:{astra:3},useAlternateLoadout:true,
    })]]);
    vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});
    const p=loadProgress();
    expect(p.schema).toBe(3);
    expect(p.missionsCleared).toEqual([]);
    expect(p.teamIds).toEqual(['astra']);
    expect(p.discoveredMoves).toContain('deep-think');
    saveProgress(p);
    expect(JSON.parse(data.get('pokaimon:progress:v3')??'{}').schema).toBe(3);
    vi.unstubAllGlobals();
  });
  it('rejects wrong encounter IDs or fabricated outcomes for campaign credit',()=>{
    const mission=getCampaignMission(CAMPAIGN_MISSIONS[0].id)!;
    const elsewhere=createBattle(CAMPAIGN_MISSIONS[1].encounter,INITIAL_MODEL);
    const fake={...elsewhere,outcome:'won' as const};
    expect(recordMissionVictory(defaultProgress,mission.id,fake)).toBe(defaultProgress);
  });
});
