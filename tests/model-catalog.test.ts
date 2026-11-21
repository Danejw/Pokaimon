import { describe, expect, it } from 'vitest';
import { MODEL_CATALOG, catalogToModels, validateCatalog } from '../src/content/modelCatalog';
import { MODELS, MOVES } from '../src/content/core';
import { getModelSprite, fallbackModelSprite } from '../src/game/pixelArt';
import { applyMove, createBattle } from '../src/battle/engine';
import { buildBattleReplay, restoreBattleReplay } from '../src/battle/replay';
import { TASK } from '../src/content/core';

describe('Phase 5: model registry', () => {
  it('keeps real-world evidence separate from simulated balance data', () => {
    expect(validateCatalog(MODEL_CATALOG, MOVES)).toEqual([]);
    expect(catalogToModels(MODEL_CATALOG)).toEqual(MODELS);
    expect(MODEL_CATALOG).toHaveLength(4);
    expect(MODEL_CATALOG.every(entry => entry.facts.reviewStatus === 'reviewed')).toBe(true);
    expect(MODEL_CATALOG.find(entry => entry.id === 'opus55')?.facts.reviewStatus).toBe('reviewed');
    expect(MODEL_CATALOG.every(entry => entry.balance.focus >= 1)).toBe(true);
  });
  it('a candidate is never playable until explicitly approved', () => {
    const candidate = {
      ...MODEL_CATALOG[0], id:'trial', publicationStatus:'candidate' as const,
      facts:{...MODEL_CATALOG[0].facts, displayName:'Test Creature', sourceUrl:'https://example.org/fictional', reviewStatus:'pending' as const, verifiedCapabilities:[]},
    };
    expect(catalogToModels([...MODEL_CATALOG,candidate])).toHaveLength(4);
    expect(validateCatalog([{...candidate, publicationStatus:'approved'}],MOVES))
      .toContain('Unreviewed playable model trial');
    const approved={...candidate,publicationStatus:'approved' as const,
      facts:{...candidate.facts,reviewStatus:'reviewed' as const}};
    const newRoster=catalogToModels([...MODEL_CATALOG,approved]);
    expect(newRoster).toHaveLength(5);
    const newModel=newRoster[4];
    expect(newModel.id).toBe('trial');
    expect(getModelSprite(newModel.id)).toBe(fallbackModelSprite);
    let battle=createBattle(TASK,newModel,1,[newModel]);
    battle=applyMove(battle,'deep-think',newModel,TASK);
    expect(battle.stageIndex).toBe(1);
  });
  it('rejects duplicate IDs, invalid references and unsafe evidence URLs', () => {
    const entry=MODEL_CATALOG[0];
    expect(validateCatalog([...MODEL_CATALOG,entry],MOVES)).toContain('Duplicate model: astra');
    expect(validateCatalog([{...entry,moveIds:['missing','deep-think','deep-research','code-execution']}],MOVES))
      .toContain('Unknown move missing in astra');
    expect(validateCatalog([{...entry,facts:{...entry.facts,sourceUrl:'javascript:evil()'}}],MOVES))
      .toContain('Invalid source URL in astra');
  });
  it('reconstructs a saved battle containing a newly registered official model',()=>{
    const opus=MODELS.find(model=>model.id==='opus55')!;
    const squad=[MODELS[0],opus];
    const initial=createBattle(TASK,opus,1,squad);
    const battle=applyMove(initial,'extended-thinking',opus,TASK);
    const replay=buildBattleReplay(battle,{encounterId:'task',modifierIds:[],roster:squad});
    expect(restoreBattleReplay(replay)).toEqual(battle);
  });
});
