import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const dir = 'test-results/visual';

test('pixel handheld screens render with consistent model portrait sprites', async ({ page }, testInfo) => {
  mkdirSync(dir, { recursive: true });
  await page.goto('./?encounter=task');
  await expect(page.getByRole('button', { name: /PLAY/i })).toBeVisible();
  await page.screenshot({ path: dir + '/home-' + testInfo.project.name + '.png', fullPage: true });

  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByRole('button', { name: 'Select GPT-6.2 Astra' })).toBeVisible();
  await expect(page.locator('.party-slot .pixel-portrait')).toHaveCount(3);
  await page.screenshot({ path: dir + '/select-' + testInfo.project.name + '.png', fullPage: true });

  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await expect(page.locator('.enemy-status')).toBeVisible();
  await expect(page.locator('.hero-status')).toBeVisible();
  await page.screenshot({ path: dir + '/battle-' + testInfo.project.name + '.png', fullPage: true });

  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);

  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /FIELD GUIDE/i }).click();
  await expect(page.locator('.guide-portrait .pixel-portrait')).toHaveCount(3);
  await page.screenshot({ path: dir + '/guide-' + testInfo.project.name + '.png', fullPage: true });
});

test('keyboard and reduced-motion pathways remain playable', async ({ page }) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('checkbox', { name: 'Reduced motion' }).check();
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  const selection = page.getByRole('button', { name: 'Select GPT-6.2 Astra' });
  await expect(selection).toBeVisible();
  await selection.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Select Grok 4.7' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(selection).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', 'command');
});
