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
export const HYDRA_CLUE={
  id:'source-duplicate',
  title:'Duplicate source trail',
  clue:'Both citations originate from the same report. They count as one source, not independent corroboration.',
} as const;
