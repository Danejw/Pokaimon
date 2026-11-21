import type { EncounterDefinition } from '../battle/types';

/** First Phase 6 signature battle. All evidence is fictional, authored and deterministic. */
export const HYDRA: EncounterDefinition = {
  id:'hydra',name:'HALLUCINATION HYDRA',level:14,category:'Evidence',
  description:'A confident claim cites two sources that might trace back to one report. Inspect before trusting the evidence.',
  mechanic:'hydra',special:'Echo Chamber',
  budget:{ap:5,turns:7},
  stages:[
    {id:'claim',label:'Question the confident claim',goal:36,accepts:['reasoning','context'],hint:'Separate the claim from evidence for it.'},
    {id:'sources',label:'Gather independent evidence',goal:36,accepts:['research'],hint:'Look for evidence with independent provenance.'},
    {id:'conclusion',label:'Verify the conclusion',goal:36,accepts:['verification'],hint:'Check the claim with independent corroboration.'},
  ],
  lesson:'Two citations pointing to one original source are not two independent confirmations. Inspect provenance and verify before trusting confident claims.',
};
export const GOLEM:EncounterDefinition={
  id:'golem',name:'REGRESSION GOLEM',level:16,category:'Debugging',mechanic:'golem',special:'Brittle Patch',
  description:'A broken app has a tempting quick fix. Diagnose before patching, or test and recover from a regression.',
  budget:{ap:6,turns:8},
  stages:[
    {id:'diagnose',label:'Identify the failure',goal:36,accepts:['reasoning','context'],hint:'Understand symptoms before making changes.'},
    {id:'patch',label:'Patch the defect',goal:36,accepts:['coding'],hint:'Repair the confirmed fault.'},
    {id:'test',label:'Run regression tests',goal:36,accepts:['verification'],hint:'A successful patch is not proof it is correct.'},
  ],
  lesson:'Test the actual defect and check for regressions. A rushed patch can create hidden rework.',
};
export const SCOPE:EncounterDefinition={
  id:'scope-shifter',name:'SCOPE SHIFTER',level:18,category:'Planning',mechanic:'scope',special:'Scope Creep',
  description:'A stakeholder changes requirements after the plan. Clarify now or revise midstream.',
  budget:{ap:6,turns:8},
  stages:[
    {id:'plan',label:'Choose an implementation plan',goal:36,accepts:['reasoning','context'],hint:'Ask what success means before committing.'},
    {id:'build',label:'Implement the plan',goal:36,accepts:['coding'],hint:'Make a clear, testable deliverable.'},
    {id:'accept',label:'Verify acceptance criteria',goal:36,accepts:['verification'],hint:'Check against the latest requirements.'},
  ],
  lesson:'Clarify constraints early or deliberately replan after a change, then test against updated acceptance criteria.',
};
export const INTELLIGENCE_TRIALS=[HYDRA,GOLEM,SCOPE] as const;
export const INTELLIGENCE_CLUES={
  hydra: {id:'source-duplicate',title:'Inspect source provenance',clue:'Both citations originate from the same report. They count as one source.'},
  golem: {id:'fault-trace',title:'Inspect failure trace',clue:'The defect is in state updates, not the rendering layer. Verify that hypothesis before patching.'},
  scope: {id:'scope-note',title:'Clarify requirements',clue:'The stakeholder expects the result to remain editable after delivery. That changes the acceptance test.'},
} as const;
export const HYDRA_CLUE={
  id:'source-duplicate',
  title:'Duplicate source trail',
  clue:'Both citations originate from the same report. They count as one source, not independent corroboration.',
} as const;
