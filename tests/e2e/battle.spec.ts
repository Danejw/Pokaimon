import { test, expect } from '@playwright/test';

test('win TASK by selecting stage-appropriate AI moves', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /PLAY/ }).click();
  await expect(page.getByText('SIMULATED BATTLE')).toBeVisible();
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(page.getByText(/Apply a solution/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Code Execution' }).click();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await page.getByRole('button', { name: /RETRY BATTLE/ }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
});
test('repeating the wrong move loses and explains why', async ({ page }) => {
  await page.goto('./');await page.getByRole('button',{name:/PLAY/}).click();
  for(let i=0;i<6;i++) await page.getByRole('button',{name:'Deep Research'}).click();
  await expect(page.getByRole('heading',{name:'TRY AGAIN'})).toBeVisible();
  await expect(page.getByText(/unfinished stage/)).toBeVisible();
});