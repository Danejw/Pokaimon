import { test,expect } from '@playwright/test';

test('Hydra inspection changes enemy response and leads to an evidence-aware win',async({page},testInfo)=>{
  await page.goto('./');
  await page.getByRole('button',{name:'CHALLENGES'}).click();
  await expect(page.getByText('Hallucination Hydra')).toBeVisible();
  await page.getByRole('button',{name:/HYDRA TRIAL/}).click();
  await page.getByRole('button',{name:'Select GPT-6.2 Astra'}).click();
  await expect(page.getByRole('button',{name:'Inspect tactical evidence'})).toBeVisible();
  await page.screenshot({path:'test-results/visual/hydra-choice-'+testInfo.project.name+'.png',fullPage:true});
  await page.getByRole('button',{name:'Inspect tactical evidence'}).click();
  await expect(page.getByRole('group',{name:'Tactical evidence notebook'})).toContainText('same report');
  await expect(page.getByRole('button',{name:'Inspect tactical evidence'})).toHaveCount(0);
  await page.getByRole('button',{name:'Deep Think'}).click();
  await expect(page.getByRole('group',{name:'Tactical evidence notebook'})).toContainText('Echo Chamber blocked!');
  await page.getByRole('button',{name:'Deep Research'}).click();
  await page.getByRole('button',{name:'Self-Correction'}).click();
  await expect(page.getByRole('heading',{name:'VICTORY!'})).toBeVisible();
  await page.screenshot({path:'test-results/visual/hydra-verified-'+testInfo.project.name+'.png',fullPage:true});
});

test('Hydra unchecked evidence raises verification burden but allows recovery',async({page},testInfo)=>{
  await page.goto('./');
  await page.getByRole('button',{name:'CHALLENGES'}).click();
  await page.getByRole('button',{name:/HYDRA TRIAL/}).click();
  await page.getByRole('button',{name:'Select GPT-6.2 Astra'}).click();
  await page.getByRole('button',{name:'Deep Think'}).click();
  await page.getByRole('button',{name:'Deep Research'}).click();
  await expect(page.getByRole('group',{name:'Tactical evidence notebook'})).toContainText('ADDITIONAL VERIFICATION');
  await page.getByRole('button',{name:'Self-Correction'}).click();
  await expect(page.getByRole('button',{name:'Self-Correction'})).toBeVisible();
  await page.getByRole('button',{name:'Self-Correction'}).click();
  await expect(page.getByRole('heading',{name:'VICTORY!'})).toBeVisible();
  await page.screenshot({path:'test-results/visual/hydra-recovery-'+testInfo.project.name+'.png',fullPage:true});
});
