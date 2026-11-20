import { test, expect } from '@playwright/test';

test('win TASK with GPT-6.2 Astra and retry', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /PLAY/ }).click();
  await page.getByRole('button', { name: /Select GPT-6.2 Astra/ }).click();
  await expect(page.getByText('SIMULATED BATTLE')).toBeVisible();
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await page.getByRole('button', { name: 'Code Execution' }).click();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await page.getByRole('button', { name: /RETRY BATTLE/ }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
});
test('poor move choices lose, with corrective feedback', async ({ page }) => {
  await page.goto('./');await page.getByRole('button',{name:/PLAY/}).click();
  await page.getByRole('button', { name: /Select GPT-6.2 Astra/ }).click();
  for(let i=0;i<6;i++) await page.getByRole('button',{name:'Deep Research'}).click();
  await expect(page.getByRole('heading',{name:'TRY AGAIN'})).toBeVisible();
  await expect(page.getByText(/unfinished stage/)).toBeVisible();
});
test('select Grok or Claude with distinct move lists', async ({ page }) => {
  await page.goto('./');await page.getByRole('button',{name:/PLAY/}).click();
  await page.getByRole('button',{name:/Select Grok 4.7/}).click();
  await expect(page.getByRole('button',{name:'Max Reasoning'})).toBeVisible();
  await page.getByRole('button', { name: /MODELS/ }).click();
  await page.getByRole('button',{name:/Select Claude Fable 5.2/}).click();
  await expect(page.getByRole('button',{name:'Extended Thinking'})).toBeVisible();
});