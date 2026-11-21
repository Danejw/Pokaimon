import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import type {ModelCatalogEntry} from '../../src/content/modelCatalog';
const generated=JSON.parse(readFileSync(new URL('../../src/content/generatedModels.json',import.meta.url),'utf8')) as ModelCatalogEntry[];
const moveInfo:Record<string,{name:string;category:string}>={
 'deep-think':{name:'Deep Think',category:'reasoning'},
 'extended-thinking':{name:'Extended Thinking',category:'reasoning'},
 'max-reasoning':{name:'Max Reasoning',category:'reasoning'},
 'context-recall':{name:'Context Recall',category:'context'},
 'code-execution':{name:'Code Execution',category:'coding'},
 'code-review':{name:'Code Review',category:'coding'},
 'deep-research':{name:'Deep Research',category:'research'},
 'parallel-search':{name:'Parallel Search',category:'research'},
 'self-correction':{name:'Self-Correction',category:'verification'},
};
const entry=generated[0];
test.skip(!entry,'No generated official evolution in the checked-in catalog. The fixture smoke job injects one in CI.');
test('generated original evolution appears in ModelDex and wins a battle',async({page},testInfo)=>{
  await page.goto('./?encounter=task');
  await page.getByRole('button',{name:'MODELDEX'}).click();
  const target=page.locator('.dex-entry').filter({hasText:entry.facts.displayName});
  await expect(target).toBeVisible();
  await expect(target).toContainText('NEW EVOLUTION');
  await expect(target).toContainText('EVOLVES FROM GPT-6.2 Astra');
  await expect(target).toContainText('GAME PASSIVE');
  await page.screenshot({path:'test-results/visual/evolution-dex-'+testInfo.project.name+'.png',fullPage:true});
  await page.getByRole('button',{name:'EDIT TEAM'}).click();
  await page.getByRole('checkbox',{name:'Team Grok 4.7'}).uncheck();
  await page.getByRole('checkbox',{name:'Team Claude Fable 5.2'}).uncheck();
  await page.getByRole('checkbox',{name:'Team '+entry.facts.displayName}).check();
  await page.getByRole('button',{name:'SAVE TEAM'}).click();
  await expect(page.getByRole('status')).toContainText('TEAM SAVED');
  await page.getByRole('button',{name:/HOME/i}).click();
  await page.getByRole('button',{name:/PLAY/i}).click();
  await page.getByRole('button',{name:'Select '+entry.facts.displayName}).click();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-model',entry.id);
  await page.screenshot({path:'test-results/visual/evolution-battle-'+testInfo.project.name+'.png',fullPage:true});
  const moves=entry.moveIds.map(id=>moveInfo[id]);
  const plan=moves.find(m=>m.category==='reasoning'||m.category==='context')!;
  const code=moves.find(m=>m.category==='coding')!;
  const verify=moves.find(m=>m.category==='verification')!;
  await page.getByRole('button',{name:plan.name}).click();
  await page.getByRole('button',{name:code.name}).click();
  await page.getByRole('button',{name:verify.name}).click();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', 'attack');
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', /command|result/);
  if(await page.getByRole('heading',{name:'VICTORY!'}).count()===0)
    await page.getByRole('button',{name:verify.name}).click();
  await expect(page.getByRole('heading',{name:'VICTORY!'})).toBeVisible();
});