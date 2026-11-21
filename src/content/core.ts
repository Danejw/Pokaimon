import type { EncounterDefinition, ModelDefinition, MoveDefinition } from '../battle/types';
import { MODEL_CATALOG, catalogToModels } from './modelCatalog';

export const MOVES: Record<string, MoveDefinition> = {
  'deep-think': { id: 'deep-think', name: 'Deep Think', category: 'reasoning', power: 42, cost: 1, animation: 'pulse', description: 'Break a difficult problem into smaller steps.', lesson: 'Reasoning helps define a plan. A plan alone cannot finish or verify a task.' },
  'deep-research': { id: 'deep-research', name: 'Deep Research', category: 'research', power: 40, cost: 1, animation: 'scan', toolRequired: 'search', description: 'Retrieve and compare evidence with sources.', lesson: 'Real research depends on actual retrieval tools and source checking. This battle is a simulation.' },
  'code-execution': { id: 'code-execution', name: 'Code Execution', category: 'coding', power: 42, cost: 1, animation: 'slash', toolRequired: 'sandbox', description: 'Put a software solution into action.', lesson: 'Executing an idea is distinct from reasoning about it. Live execution would need a permitted sandbox.' },
  'self-correction': { id: 'self-correction', name: 'Self-Correction', category: 'verification', power: 40, cost: 1, animation: 'shield', description: 'Check a result and repair mistakes.', lesson: 'Verifying and revising output improves reliability. Independent tests remain important.' },
  'max-reasoning': { id:'max-reasoning', name:'Max Reasoning', category:'reasoning', power:44, cost:1, animation:'pulse', description:'Spend extra effort analyzing a difficult decision.', lesson:'Increasing reasoning effort can help complex problems, though independent verification remains valuable.' },
  'context-recall': { id:'context-recall', name:'Context Recall', category:'context', power:42, cost:1, animation:'scan', description:'Use the relevant conversation and constraints.', lesson:'Supplying relevant context and instructions can improve task understanding.' },
  'parallel-search': { id:'parallel-search', name:'Parallel Search', category:'research', power:54, cost:2, animation:'scan', toolRequired:'search', description:'Search multiple independent angles for evidence.', lesson:'Parallel retrieval broadens coverage. Source quality still needs checking.' },
  'code-review': { id:'code-review', name:'Code Review', category:'coding', power:42, cost:1, tacticalEffect:'guard', animation:'shield', description:'Inspect code changes for bugs and useful fixes.', lesson:'Review helps identify defects and check a proposed fix. Executed tests are still necessary for real verification.' },
  'extended-thinking': { id:'extended-thinking', name:'Extended Thinking', category:'reasoning', power:43, cost:1, animation:'pulse', description:'Work through a complicated problem deliberately.', lesson:'Reasoning time is valuable for complex decisions, but reasoning is different from running a test.' },
};
export const MODELS: readonly ModelDefinition[] = catalogToModels(MODEL_CATALOG);
export const INITIAL_MODEL: ModelDefinition = MODELS[0];
export function getModel(id: string): ModelDefinition | undefined {
  return MODELS.find(model => model.id === id);
}
export function validateRoster(models: readonly ModelDefinition[] = MODELS, moves = MOVES): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const model of models) {
    if (ids.has(model.id)) errors.push('Duplicate model: ' + model.id);
    ids.add(model.id);
    if (model.moveIds.length !== 4) errors.push(model.id + ' must equip four moves');
    if (!model.source.startsWith('https://') || !model.verifiedAt) errors.push('Source missing: '+model.id);
    for (const id of model.moveIds) {
      if (!moves[id]) errors.push(model.id + ' has unknown move: '+id);
      else if (moves[id].cost < 1 || !moves[id].lesson || !moves[id].animation) errors.push('Invalid move: '+id);
    }
  }
  return errors;
}

export const TASK: EncounterDefinition = {
  id: 'task', name: 'TASK', level: 5, category: 'Workflow', description: 'A software-workflow problem. Plan a fix, apply an approach, and verify the result.',
  special: 'Scope Shift', specialEffect: 'scope-shift',
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