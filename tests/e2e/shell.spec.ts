import { test, expect } from '@playwright/test';

test('home starts a wild encounter, no challenge picker, then back home', async ({ page }) => {
  await page.goto('./?encounter=task');
  await expect(page.getByRole('heading', { name: /Master your models/i })).toBeVisible();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByText('A wild TASK appeared!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose a challenge' })).toHaveCount(0);
  await page.getByRole('button', { name: /HOME/i }).click();
  await expect(page.getByRole('heading', { name: /Master your models/i })).toBeVisible();
});
test('preferences persist and field guide remains usable', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('checkbox', { name: 'Sound' }).uncheck();
  await page.getByRole('checkbox', { name: 'Reduced motion' }).check();
  await page.reload();
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await expect(page.getByRole('checkbox', { name: 'Sound' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Reduced motion' })).toBeChecked();
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /FIELD GUIDE/i }).click();
  await expect(page.getByRole('heading', { name: 'Know your moves' })).toBeVisible();
});
test('mobile and desktop layout avoid horizontal overflow', async ({ page }) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByRole('button', { name: 'Select GPT-6.2 Astra' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  expect(overflow).toBe(false);
});
