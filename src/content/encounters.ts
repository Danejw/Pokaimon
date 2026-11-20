import type { Capability, EncounterDefinition, ModelDefinition } from '../battle/types';
import { MOVES, TASK } from './core';

export const BUG: EncounterDefinition = {
  id:'bug', name:'BUG', level:7, category:'Coding',
  description:'A defect is hiding in a code change. Diagnose the issue, propose a fix, and review the result.',
  special:'Regression', specialEffect:'regression',
  stages:[
    {id:'diagnose',label:'Diagnose the bug',goal:36,accepts:['reasoning','context'],hint:'Identify the cause before changing code.'},
    {id:'fix',label:'Fix the defect',goal:36,accepts:['coding'],hint:'Choose a coding move to develop a solution.'},
    {id:'test',label:'Test the repair',goal:36,accepts:['verification','coding'],hint:'Check the repaired behavior and remaining risks.'},
  ],lesson:'Reasoning, implementation and testing are separate steps. A regression can reopen work you thought was finished.',
};
export const RESEARCH: EncounterDefinition = {
  id:'research',name:'RESEARCH REQUEST',level:9,category:'Research',
  description:'A question needs credible evidence from more than one angle.',
  special:'Source Conflict',specialEffect:'source-conflict',
  stages:[
    {id:'question',label:'Define the question',goal:36,accepts:['reasoning','context'],hint:'Clarify what evidence would answer the question.'},
    {id:'sources',label:'Collect sources',goal:36,accepts:['research'],hint:'Use a retrieval or search technique to find evidence.'},
    {id:'verify',label:'Corroborate claims',goal:36,accepts:['verification','research'],hint:'Compare sources and check conflicting claims.'},
  ],lesson:'Retrieval finds evidence, while corroboration establishes whether it can be trusted. Claims should cite actual sources in real work.',
};
export const MATH: EncounterDefinition = {
  id:'math',name:'MATH PROBLEM',level:10,category:'Reasoning',
  description:'Solve a multi-step problem, check your assumptions, and verify the result.',
  special:'Hidden Assumption',specialEffect:'hidden-assumption',
  stages:[
    {id:'parse',label:'Read the problem',goal:36,accepts:['reasoning','context'],hint:'Understand the givens and constraints.'},
    {id:'solve',label:'Calculate a solution',goal:36,accepts:['reasoning','coding'],hint:'Reason through the steps or use a calculation tool.'},
    {id:'check',label:'Check the answer',goal:36,accepts:['verification','coding'],hint:'Recalculate or independently test the answer.'},
  ],lesson:'Reasoned steps help, but final answers still need a separate check for mistakes and hidden assumptions.',
};
export const HALLUCINATION: EncounterDefinition = {
  id:'hallucination',name:'HALLUCINATION',level:12,category:'Verification',
  description:'A confident-looking claim may be false. Find independent evidence and verify it.',
  special:'False Lead',specialEffect:'false-lead',
  stages:[
    {id:'question',label:'Challenge the claim',goal:36,accepts:['reasoning','context'],hint:'Identify what exactly needs verification.'},
    {id:'evidence',label:'Find evidence',goal:36,accepts:['research'],hint:'Use external reliable sources rather than repeating the claim.'},
    {id:'fact-check',label:'Fact-check the answer',goal:36,accepts:['verification'],hint:'Corroborate the claims with independent evidence.'},
  ],lesson:'Fluent answers can be wrong. Verify claims against trustworthy evidence before treating them as facts.',
};
export const ENCOUNTERS: readonly EncounterDefinition[] = [TASK,BUG,RESEARCH,MATH,HALLUCINATION];
export function encounterById(id: string): EncounterDefinition | undefined { return ENCOUNTERS.find(x=>x.id===id); }
export function isUnlocked(id: string, cleared: readonly string[]): boolean {
  const i=ENCOUNTERS.findIndex(x=>x.id===id);
  return i>=0&&(i===0||cleared.includes(ENCOUNTERS[i-1].id));
}
export function canUseModel(encounter: EncounterDefinition, model: ModelDefinition): boolean {
  const capabilities=new Set(model.moveIds.map(id=>MOVES[id]?.category).filter((x): x is Capability => Boolean(x)));
  return encounter.stages.every(stage=>stage.accepts.some(category=>capabilities.has(category)));
}
export function missingForModel(encounter: EncounterDefinition, model: ModelDefinition): string[] {
  const capabilities=new Set(model.moveIds.map(id=>MOVES[id]?.category));
  return encounter.stages.filter(stage=>!stage.accepts.some(category=>capabilities.has(category))).map(s=>s.label);
}
export function validateEncounters(): string[] {
  const errors: string[]=[];
  const ids=new Set<string>();
  for(const e of ENCOUNTERS){
    if(ids.has(e.id)) errors.push('Duplicate encounter '+e.id);
    ids.add(e.id);
    if(!e.description||!e.lesson||e.stages.length<2) errors.push('Incomplete encounter '+e.id);
    const stageIds=new Set<string>();
    for(const stage of e.stages){
      if(stageIds.has(stage.id)) errors.push('Duplicate stage '+stage.id+' in '+e.id);
      stageIds.add(stage.id);
      if(stage.goal<=0||stage.accepts.length===0||!stage.hint) errors.push('Invalid stage '+stage.id+' in '+e.id);
    }
  }
  return errors;
}