import type { EncounterDefinition, ModelDefinition, MoveDefinition } from '../battle/types';

export const MOVES: Record<string, MoveDefinition> = {
  'deep-think': { id: 'deep-think', name: 'Deep Think', category: 'reasoning', power: 42, cost: 1, animation: 'pulse', description: 'Break a difficult problem into smaller steps.', lesson: 'Reasoning helps define a plan. A plan alone cannot finish or verify a task.' },
  'deep-research': { id: 'deep-research', name: 'Deep Research', category: 'research', power: 40, cost: 1, animation: 'scan', toolRequired: 'search', description: 'Retrieve and compare evidence with sources.', lesson: 'Real research depends on actual retrieval tools and source checking. This battle is a simulation.' },
  'code-execution': { id: 'code-execution', name: 'Code Execution', category: 'coding', power: 42, cost: 1, animation: 'slash', toolRequired: 'sandbox', description: 'Put a software solution into action.', lesson: 'Executing an idea is distinct from reasoning about it. Live execution would need a permitted sandbox.' },
  'self-correction': { id: 'self-correction', name: 'Self-Correction', category: 'verification', power: 40, cost: 1, animation: 'shield', description: 'Check a result and repair mistakes.', lesson: 'Verifying and revising output improves reliability. Independent tests remain important.' },
};
export const INITIAL_MODEL: ModelDefinition = {
  id: 'astra', provider: 'OpenAI', displayName: 'GPT-6.2 Astra', version: '6.2',
  description: 'An AI model with a game-balanced reasoning-oriented loadout.', source: 'https://developers.openai.com/api/docs/models/gpt-6.2-astra',
  verifiedAt: '2026-11-19', moveIds: ['deep-think', 'deep-research', 'code-execution', 'self-correction'],
  palette: '#7ce7d1', focus: 4, tempo: 3, precision: 4,
};
export const TASK: EncounterDefinition = {
  id: 'task', name: 'TASK', level: 5, category: 'Workflow', description: 'A software-workflow problem. Plan a fix, apply an approach, and verify the result.',
  special: 'Scope Shift',
  stages: [
    { id: 'plan', label: 'Understand & plan', goal: 36, accepts: ['reasoning','research','context'], hint: 'Break the problem down before acting.' },
    { id: 'execute', label: 'Apply a solution', goal: 36, accepts: ['coding'], hint: 'Choose a move that can work on the software solution.' },
    { id: 'verify', label: 'Verify completion', goal: 36, accepts: ['verification','coding'], hint: 'Review the result before declaring victory.' },
  ],
  lesson: 'A real task usually takes planning, an action, and verification. Choosing the right kind of move matters more than repeating a powerful one.',
};
export function movesFor(model: ModelDefinition, moves = MOVES): MoveDefinition[] {
  return model.moveIds.map(id => moves[id]).filter((x): x is MoveDefinition => Boolean(x));
}