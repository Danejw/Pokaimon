import { test, expect } from '@playwright/test';

test('home, model selection, battle, home navigation', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /Master your models/i })).toBeVisible();
  await page.getByRole('button', { name: /PLAY/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose your AI' })).toBeVisible();
  await page.getByRole('button', { name: /Select GPT-6.2 Astra/ }).click();
  await expect(page.getByText('SIMULATED BATTLE')).toBeVisible();
  await expect(page.getByTestId('phaser-stage')).toBeVisible();
  await page.getByRole('button', { name: /MODELS/ }).click();
  await page.getByRole('button', { name: /HOME/ }).click();
  await expect(page.getByRole('heading', { name: /Master your models/i })).toBeVisible();
});
test('settings persist through reload', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /SETTINGS/ }).click();
  await page.getByRole('checkbox', { name: 'Sound' }).uncheck();
  await page.getByRole('checkbox', { name: 'Reduced motion' }).check();
  await page.reload();
  await page.getByRole('button', { name: /SETTINGS/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Sound' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Reduced motion' })).toBeChecked();
});
test('portrait UI does not overflow and Escape navigates', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /PLAY/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: /Master your models/i })).toBeVisible();
  await page.getByRole('button', { name: /PLAY/ }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});