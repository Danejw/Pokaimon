import type { ModelDefinition, MoveDefinition } from '../battle/types';

/** Game publication approval and real-world evidence review are separate decisions. */
export type PublicationStatus = 'candidate' | 'approved' | 'retired';
export interface ModelCatalogEntry {
  id: string;
  publicationStatus: PublicationStatus;
  facts: {
    provider: string;
    displayName: string;
    version: string;
    sourceUrl: string;
    recordedAt: string;
    reviewStatus: 'pending' | 'reviewed';
    /** Only explicitly sourced capabilities belong here. Empty means no claims verified. */
    verifiedCapabilities: readonly string[];
    providerModelId?: string;
  };
  description: string;
  moveIds: readonly [string, string, string, string];
  palette: string;
  /** Fictional balance stats, NEVER performance benchmarks. */
  balance: { focus: number; tempo: number; precision: number; patch: string };
}

/** Migrated from the existing playable roster. Its old documentation dates
 * were content-entry dates, not proof of current capability verification. */
export const MODEL_CATALOG: readonly ModelCatalogEntry[] = [
  {
    id:'astra',publicationStatus:'approved',
    facts:{provider:'OpenAI',displayName:'GPT-6.2 Astra',version:'6.2',
      sourceUrl:'https://developers.openai.com/api/docs/models/gpt-6.2-astra',
      providerModelId:'gpt-6.2-astra',
      recordedAt:'2026-11-20',reviewStatus:'reviewed',
      verifiedCapabilities:['text','image-input','reasoning','tool-use','coding']},
    description:'An AI model with a game-balanced reasoning-oriented loadout.',
    moveIds:['deep-think','deep-research','code-execution','self-correction'],
    palette:'#7ce7d1',balance:{focus:4,tempo:3,precision:4,patch:'1'},
  },
  {
    id:'grok',publicationStatus:'approved',
    facts:{provider:'xAI',displayName:'Grok 4.7',version:'4.7',
      sourceUrl:'https://x.ai/news/grok-4-7',
      providerModelId:'grok-4.7',
      recordedAt:'2026-11-20',reviewStatus:'reviewed',
      verifiedCapabilities:['text','reasoning','tool-use','coding']},
    description:'A lively, search-oriented gameplay loadout. Stats reflect game balance.',
    moveIds:['max-reasoning','context-recall','parallel-search','code-review'],
    palette:'#b9a7ff',balance:{focus:4,tempo:4,precision:3,patch:'1'},
  },
  {
    id:'fable',publicationStatus:'approved',
    facts:{provider:'Anthropic',displayName:'Claude Fable 5.2',version:'5.2',
      sourceUrl:'https://platform.claude.com/docs/en/models/fable-5-2/overview',
      providerModelId:'claude-fable-5-2',
      recordedAt:'2026-11-20',reviewStatus:'reviewed',
      verifiedCapabilities:['text','image-input','reasoning','tool-use','adaptive-thinking']},
    description:'A careful technical reviewer gameplay loadout. Stats reflect game balance.',
    moveIds:['extended-thinking','context-recall','code-review','self-correction'],
    palette:'#f5ae82',balance:{focus:4,tempo:3,precision:4,patch:'1'},
  },

  {
    id:'opus55',publicationStatus:'approved',
    facts:{provider:'Anthropic',displayName:'Claude Opus 5.5',version:'5.5',
      providerModelId:'claude-opus-5-5',
      sourceUrl:'https://platform.claude.com/docs/en/models/opus-5-5/overview',
      recordedAt:'2026-11-20',reviewStatus:'reviewed',
      verifiedCapabilities:['text','image-input','tool-use','adaptive-thinking']},
    description:'A simulated coding-and-research tactician. Real model features are documented separately; battle strengths are fictional.',
    moveIds:['extended-thinking','deep-research','code-review','self-correction'],
    palette:'#b6a0d8',balance:{focus:4,tempo:3,precision:4,patch:'1'},
  },
];

export function validateCatalog(entries: readonly ModelCatalogEntry[], moves: Record<string,MoveDefinition>): string[] {
  const errors: string[]=[];
  const ids=new Set<string>();
  for(const entry of entries) {
    if(!/^[a-z0-9-]{2,48}$/.test(entry.id))errors.push('Invalid model ID: '+entry.id);
    if(ids.has(entry.id))errors.push('Duplicate model: '+entry.id);
    ids.add(entry.id);
    if(!['candidate','approved','retired'].includes(entry.publicationStatus))
      errors.push('Invalid publication status in '+entry.id);
    if(!['pending','reviewed'].includes(entry.facts.reviewStatus))
      errors.push('Invalid evidence review status in '+entry.id);
    if(!/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(entry.facts.sourceUrl)||
       /[<>"'\\\s]/.test(entry.facts.sourceUrl))
      errors.push('Invalid source URL in '+entry.id);
    if(!entry.facts.recordedAt.match(/^\d{4}-\d{2}-\d{2}$/) ||
       !entry.facts.provider.trim()||!entry.facts.displayName.trim()||!entry.facts.version.trim())
      errors.push('Incomplete factual metadata in '+entry.id);
    if(entry.moveIds.length!==4||new Set(entry.moveIds).size!==4)
      errors.push('Expected four unique moves in '+entry.id);
    for(const moveId of entry.moveIds)if(!moves[moveId])errors.push('Unknown move '+moveId+' in '+entry.id);
    for(const value of [entry.balance.focus,entry.balance.tempo,entry.balance.precision])
      if(!Number.isInteger(value)||value<1||value>10)errors.push('Invalid game balance in '+entry.id);
    if(!/^#[0-9a-fA-F]{6}$/.test(entry.palette))errors.push('Invalid palette in '+entry.id);
    if(!entry.description.trim()||!entry.balance.patch.trim())
      errors.push('Incomplete game balance in '+entry.id);
    if(entry.facts.reviewStatus==='pending'&&entry.facts.verifiedCapabilities.length>0)
      errors.push('Unreviewed capability claims in '+entry.id);
    if(entry.publicationStatus==='approved'&&entry.facts.reviewStatus!=='reviewed')
      errors.push('Unreviewed playable model '+entry.id);
  }
  return errors;
}

export function catalogToModels(entries: readonly ModelCatalogEntry[]): ModelDefinition[] {
  return entries.filter(entry=>entry.publicationStatus==='approved' && entry.facts.reviewStatus==='reviewed').map(entry=>({
    id:entry.id,provider:entry.facts.provider,displayName:entry.facts.displayName,
    version:entry.facts.version,source:entry.facts.sourceUrl,
    verifiedAt:entry.facts.recordedAt,description:entry.description,
    moveIds:entry.moveIds,palette:entry.palette,
    focus:entry.balance.focus,tempo:entry.balance.tempo,precision:entry.balance.precision,
  }));
}

export function getCatalogEntry(id:string):ModelCatalogEntry|undefined {
  return MODEL_CATALOG.find(entry=>entry.id===id);
}
