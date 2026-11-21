import {test,expect} from '@playwright/test';
async function start(page:import('@playwright/test').Page,label:string,model='GPT-6.2 Astra'){
  await page.goto('./');await page.getByRole('button',{name:'CHALLENGES'}).click();
  await page.getByRole('button',{name:label}).click();
  await page.getByRole('button',{name:'Select '+model}).click();
}
test('Regression Golem: diagnosis prevents untested patch and wins on desktop/mobile',async({page},testInfo)=>{
  await start(page,'▶ GOLEM TRIAL');
  await expect(page.getByRole('button',{name:'Inspect tactical evidence'})).toBeVisible();
  await page.screenshot({path:'test-results/visual/golem-choice-'+testInfo.project.name+'.png',fullPage:true});
  await page.getByRole('button',{name:'Inspect tactical evidence'}).click();
  await expect(page.getByRole('group',{name:'Tactical evidence notebook'})).toContainText('state updates');
  for(const move of ['Deep Think','Code Execution','Self-Correction'])await page.getByRole('button',{name:move}).click();
  await expect(page.getByRole('heading',{name:'VICTORY!'})).toBeVisible();
  await expect(page.locator('.strategy-recap')).toContainText('Clue investigated');
  await page.screenshot({path:'test-results/visual/golem-win-'+testInfo.project.name+'.png',fullPage:true});
});
test('Scope Shifter: recover by replanning after scope change',async({page},testInfo)=>{
  await start(page,'▶ SCOPE TRIAL');
  await page.getByRole('button',{name:'Deep Think'}).click();
  await expect(page.getByRole('button',{name:'Replan after scope change'})).toBeVisible();
  await expect(page.getByRole('group',{name:'Tactical evidence notebook'})).toContainText('Scope Creep');
  await page.getByRole('button',{name:'Replan after scope change'}).click();
  for(const move of ['Code Execution','Self-Correction'])await page.getByRole('button',{name:move}).click();
  await expect(page.getByRole('heading',{name:'VICTORY!'})).toBeVisible();
  await expect(page.locator('.strategy-recap')).toContainText('Plan revised');
  await page.screenshot({path:'test-results/visual/scope-replan-'+testInfo.project.name+'.png',fullPage:true});
});
