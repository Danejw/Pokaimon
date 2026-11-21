import type { EncounterDefinition } from '../battle/types';
import { BUG, HALLUCINATION, MATH, RESEARCH } from './encounters';
import { TASK } from './core';

export type MissionKind = 'wild' | 'rival' | 'boss';
export interface CampaignMission {
  id: string;
  title: string;
  chapterId: string;
  kind: MissionKind;
  briefing: string;
  encounter: EncounterDefinition;
}
export interface CampaignChapter {
  id: string;
  title: string;
  tagline: string;
  missionIds: readonly [string,string,string];
}
export const CAMPAIGN_CHAPTERS: readonly CampaignChapter[] = [
  {id:'workshop',title:'The Workshop',tagline:'Plan. Build. Verify.',missionIds:['workshop-task','workshop-rival','workshop-boss']},
  {id:'evidence',title:'The Evidence Lab',tagline:'Search. Compare. Question.',missionIds:['evidence-research','evidence-rival','evidence-boss']},
  {id:'logic',title:'The Logic Arena',tagline:'Reason. Adapt. Prove.',missionIds:['logic-math','logic-rival','logic-boss']},
];

const rushRival: EncounterDefinition = {
  id:'rush-rival',name:'RUSH RIVAL',level:8,category:'Rival',
  description:'Patch Sprinter rushes through an ambiguous specification, hoping repeated reasoning will be enough.',
  special:'Deadline Trap',specialEffect:'scope-shift',
  rival:{name:'Patch Sprinter',repeatPenalty:10},
  stages:[
    {id:'requirements',label:'Decode the request',goal:36,accepts:['reasoning','context'],hint:'Read the request carefully.'},
    {id:'strategy',label:'Choose an approach',goal:36,accepts:['reasoning','context'],hint:'Try an alternate technique rather than repeating blindly.'},
    {id:'deliver',label:'Check the release',goal:36,accepts:['verification','coding'],hint:'Validate the proposed work.'},
  ],
  lesson:'Repeating the same tactic can be costly. Change approach when the problem changes.',
};
const citationRival: EncounterDefinition = {
  id:'citation-rival',name:'CITATION SPECTER',level:12,category:'Rival',
  description:'A mysterious rival finds many sources, but struggles to challenge their reliability.',
  special:'Source Conflict',specialEffect:'source-conflict',
  rival:{name:'Citation Specter',repeatPenalty:12},
  stages:[
    {id:'question',label:'Ask a clear question',goal:36,accepts:['reasoning','context'],hint:'Define the question first.'},
    {id:'gather',label:'Gather evidence',goal:36,accepts:['research'],hint:'Find a relevant source.'},
    {id:'crosscheck',label:'Cross-check',goal:36,accepts:['research','verification'],hint:'Compare independent evidence rather than copying a single claim.'},
  ],
  lesson:'A second angle can uncover flaws that a repeated search misses.',
};
const clockworkRival: EncounterDefinition = {
  id:'clockwork-rival',name:'CLOCKWORK RIVAL',level:16,category:'Rival',
  description:'An original mechanical rival tries to force predictable strategies.',
  special:'Hidden Assumption',specialEffect:'hidden-assumption',
  rival:{name:'Clockwork Tactician',repeatPenalty:14},
  stages:[
    {id:'parse',label:'Parse the challenge',goal:36,accepts:['reasoning','context'],hint:'Know the constraints.'},
    {id:'rethink',label:'Find a new angle',goal:36,accepts:['reasoning','context'],hint:'Change your reasoning technique.'},
    {id:'prove',label:'Verify the answer',goal:36,accepts:['verification','coding'],hint:'Independently check your answer.'},
  ],
  lesson:'Adaptation beats a predictable sequence of repeated moves.',
};
const scopeGiant: EncounterDefinition = {
  ...TASK,id:'scope-giant',name:'SCOPE GIANT',level:12,
  description:'The Workshop boss keeps adding requirements to the final audit.',
  special:'Scope Surge',specialEffect:'scope-shift',
  boss:{label:'FINAL AUDIT',phaseAt:2,effect:'audit',amount:12},
  lesson:'Plan scope and leave room for final verification. Scope changes cannot be solved by repeating the first move.',
};
const falseSignal: EncounterDefinition = {
  ...RESEARCH,id:'false-signal',name:'FALSE SIGNAL',level:16,
  description:'The Evidence Lab boss reopens settled questions as new contradictions appear.',
  special:'Source Conflict',specialEffect:'source-conflict',
  boss:{label:'CONTRADICTION STORM',phaseAt:2,effect:'reopen',amount:16},
  lesson:'Conflicting evidence can reopen earlier work. Validate sources before declaring confidence.',
};
const adaptiveTrial: EncounterDefinition = {
  ...MATH,id:'adaptive-trial',name:'ADAPTIVE TRIAL',level:20,
  description:'The Logic Arena boss tightens the action budget just before final verification.',
  special:'Hidden Assumption',specialEffect:'hidden-assumption',
  boss:{label:'TIME PRESSURE',phaseAt:2,effect:'drain',amount:1},
  lesson:'Time and tool budgets are part of selecting a reliable strategy. Reserve effort for checking the result.',
};

export const CAMPAIGN_MISSIONS: readonly CampaignMission[] = [
  {id:'workshop-task',title:'First Assignment',chapterId:'workshop',kind:'wild',
   briefing:'Understand a task, apply an approach, and verify the result.',encounter:TASK},
  {id:'workshop-rival',title:'Patch Sprinter',chapterId:'workshop',kind:'rival',
   briefing:'Your first rival punishes repeating the same technique.',encounter:rushRival},
  {id:'workshop-boss',title:'Scope Giant',chapterId:'workshop',kind:'boss',
   briefing:'A three-stage boss prepares an extra final audit.',encounter:scopeGiant},
  {id:'evidence-research',title:'Source Hunt',chapterId:'evidence',kind:'wild',
   briefing:'Find and compare independent evidence.',encounter:RESEARCH},
  {id:'evidence-rival',title:'Citation Specter',chapterId:'evidence',kind:'rival',
   briefing:'A rival exploits uncritical research repetition.',encounter:citationRival},
  {id:'evidence-boss',title:'False Signal',chapterId:'evidence',kind:'boss',
   briefing:'Expect a contradiction to reopen old evidence.',encounter:falseSignal},
  {id:'logic-math',title:'Logic Practice',chapterId:'logic',kind:'wild',
   briefing:'Reason, solve and independently check the result.',encounter:MATH},
  {id:'logic-rival',title:'Clockwork Tactician',chapterId:'logic',kind:'rival',
   briefing:'A rival watches for predictable repeated tactics.',encounter:clockworkRival},
  {id:'logic-boss',title:'Adaptive Trial',chapterId:'logic',kind:'boss',
   briefing:'The final boss changes your action budget mid-encounter.',encounter:adaptiveTrial},
];

export function getCampaignMission(id:string):CampaignMission|undefined {
  return CAMPAIGN_MISSIONS.find(m=>m.id===id);
}
export function isMissionUnlocked(id:string,cleared:readonly string[]):boolean {
  const index=CAMPAIGN_MISSIONS.findIndex(m=>m.id===id);
  return index>=0 && (index===0 || cleared.includes(CAMPAIGN_MISSIONS[index-1].id));
}
export function isChapterComplete(chapter:CampaignChapter,cleared:readonly string[]):boolean {
  return chapter.missionIds.every(id=>cleared.includes(id));
}
