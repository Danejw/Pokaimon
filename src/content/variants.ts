import type { EncounterDefinition } from '../battle/types';
import { ENCOUNTERS } from './encounters';

export type ModifierId = 'extra-audit' | 'tight-budget' | 'counter-rotation';
export interface ScenarioCode {
  encounterId: string;
  seed: number;
  modifierIds: ModifierId[];
}
const allowed = new Set<ModifierId>(['extra-audit','tight-budget','counter-rotation']);
const validSeed = (seed:number):boolean => Number.isSafeInteger(seed)&&seed>0&&seed<=999999;

/** A fixed set of authored modifiers. Seed controls a limited, reproducible rule variant. */
export function makeEncounter(
  encounterId:string, seed:number, modifierIds:readonly ModifierId[],
): EncounterDefinition|null {
  const template=ENCOUNTERS.find(e=>e.id===encounterId);
  if(!template||!validSeed(seed)||modifierIds.length>2||
      new Set(modifierIds).size!==modifierIds.length||
      modifierIds.some(id=>!allowed.has(id)))return null;
  const stages=template.stages.map(stage=>({...stage,accepts:[...stage.accepts]}));
  const scenario:EncounterDefinition={...template,stages};
  if(modifierIds.includes('extra-audit')) {
    stages[stages.length-1].goal+=12;
  }
  if(modifierIds.includes('tight-budget')) {
    scenario.budget={ap:5,turns:8};
  }
  if(modifierIds.includes('counter-rotation')) {
    const odd=seed%2===1;
    scenario.specialEffect=odd?'hidden-assumption':'source-conflict';
    scenario.special=odd?'Hidden Assumption':'Source Conflict';
  }
  return scenario;
}

export function encodeChallengeCode(data:ScenarioCode):string {
  if(!makeEncounter(data.encounterId,data.seed,data.modifierIds))return '';
  return ['PK1',data.encounterId,String(data.seed),data.modifierIds.join('+')||'none'].join('.');
}

export function decodeChallengeCode(code:string):ScenarioCode|null {
  if(typeof code!=='string'||code.length>90||code.length<10)return null;
  const parts=code.split('.');
  if(parts.length!==4||parts[0]!=='PK1'||!/^\d{1,6}$/.test(parts[2]))return null;
  const seed=Number(parts[2]);
  if(String(seed)!==parts[2])return null;
  const modifierIds=(parts[3]==='none'?[]:parts[3].split('+')) as ModifierId[];
  if(!makeEncounter(parts[1],seed,modifierIds))return null;
  return {encounterId:parts[1],seed,modifierIds};
}
