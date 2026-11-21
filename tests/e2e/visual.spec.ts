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
  // Native 360x330 handheld canvas with crisp, integer-pixel character art.
  const dimensions = await page.locator('.battle-stage canvas').evaluate(canvas => {
    const element = canvas as HTMLCanvasElement;
    return { width: element.width, height: element.height };
  });
  expect(dimensions).toEqual({ width: 360, height: 330 });
  await expect(page.locator('.battle-stage canvas')).toHaveCSS('image-rendering', 'pixelated');
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

test('entire player choice menu fits a portrait phone viewport without page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByRole('button', { name: 'Select Claude Fable 5.2' })).toBeVisible();
  const fits = await page.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight + 8 &&
    document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(fits).toBe(true);
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Self-Correction' })).toBeVisible();
  const moveFits = await page.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight + 8,
  );
  expect(moveFits).toBe(true);
});

test('dialogue remains readable and effects reuse one audio context', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeContext = window.AudioContext;
    if (!NativeContext) return;
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: class extends NativeContext {
        constructor() {
          super();
          const tracked = window as Window & { __pokaimonAudioContexts?: number };
          tracked.__pokaimonAudioContexts = (tracked.__pokaimonAudioContexts ?? 0) + 1;
        }
      },
    });
  });
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  const dialogue = page.locator('.retro-dialogue p');
  await expect(dialogue).toHaveCSS('font-family', /Chakra Petch/);
  const size = await dialogue.evaluate(node => Number.parseFloat(getComputedStyle(node).fontSize));
  expect(size).toBeGreaterThanOrEqual(16);
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  const move = page.getByRole('button', { name: 'Deep Think' });
  await expect(move).toBeVisible();
  await expect(move).toHaveCSS('font-family', /Chakra Petch/);
  // Phaser owns additional contexts; compare before and after SFX instead.
  const contextsBefore = await page.evaluate(() =>
    (window as Window & { __pokaimonAudioContexts?: number }).__pokaimonAudioContexts ?? 0
  );
  expect(contextsBefore).toBeGreaterThan(0);
  await move.click();
  const contextsAfter = await page.evaluate(() =>
    (window as Window & { __pokaimonAudioContexts?: number }).__pokaimonAudioContexts ?? 0
  );
  expect(contextsAfter).toBe(contextsBefore);
});

test('Grok and Math reference pair retains readable original pixel art', async ({ page }, testInfo) => {
  mkdirSync(dir, { recursive: true });
  await page.goto('./?encounter=math');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByRole('button', { name: 'Select Grok 4.7' })).toBeVisible();
  await page.getByRole('button', { name: 'Select Grok 4.7' }).click();
  await expect(page.getByRole('button', { name: 'Max Reasoning' })).toBeVisible();
  await expect(page.locator('.enemy-status')).toContainText('MATH PROBLEM');
  await expect(page.locator('.hero-status')).toContainText('Grok 4.7');
  await page.screenshot({
    path: dir + '/grok-math-' + testInfo.project.name + '.png', fullPage: true,
  });
});


test('tactical preview matches real stage progress and earns the four-turn medal', async ({ page }, testInfo) => {
  mkdirSync(dir, { recursive:true });
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('combobox', { name: 'Difficulty' }).selectOption('easy');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name:'Select GPT-6.2 Astra' }).click();
  const stage = page.getByTestId('phaser-stage');
  await expect(stage).toHaveAttribute('data-phase','command');

  await expect(page.locator('.stage-intel')).toContainText('STEP 1/3');
  await expect(page.getByRole('button', { name:'Deep Think' })).toHaveClass(/is-effective/);
  await expect(page.getByRole('button', { name:'Code Execution' })).toHaveClass(/is-mismatch/);
  await page.screenshot({ path:dir+'/tactics-'+testInfo.project.name+'.png',fullPage:true });
  await page.getByRole('button', { name:'Deep Think' }).click();
  await expect(stage).toHaveAttribute('data-phase','command');
  await expect(page.locator('.stage-intel')).toContainText('STEP 2/3');
  await expect(page.getByRole('button', { name:'Code Execution' })).toHaveClass(/is-effective/);
  await expect(page.locator('.battle-intent')).toContainText('Scope Shift');
  await page.getByRole('button', { name:'Code Execution' }).click();
  await expect(stage).toHaveAttribute('data-phase','command');
  await expect(page.locator('.stage-intel')).toContainText('STEP 3/3');
  await page.getByRole('button', { name:'Self-Correction' }).click();
  await expect(stage).toHaveAttribute('data-phase','command');
  await page.getByRole('button', { name:'Self-Correction' }).click();
  await expect(page.getByText('TACTICAL CLEAR')).toBeVisible();
  await expect(page.locator('.retro-dialogue p')).toContainText('TASK completed!');
  await expect(page.locator('.retro-dialogue small')).toContainText('All 3 steps complete.');
  const dialogueHeight = await page.locator('.retro-dialogue').evaluate(node =>
    node.getBoundingClientRect().height
  );
  expect(dialogueHeight).toBeLessThan(140);
  await page.screenshot({ path:dir+'/tactical-win-'+testInfo.project.name+'.png',fullPage:true });
});

test('focused move explains its real technique before the player commits', async ({ page }) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('combobox', { name: 'Difficulty' }).selectOption('easy');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', 'command');
  await page.getByRole('button', { name: 'Deep Think' }).focus();
  await expect(page.locator('.move-lesson')).toContainText('Break a difficult problem into smaller steps.');
  await page.getByRole('button', { name: 'Code Execution' }).focus();
  await expect(page.locator('.move-lesson')).toContainText('Put a software solution into action.');
  await expect(page.locator('.move-lesson')).toContainText('No progress on this step');
  await expect(page.getByRole('button', { name: 'Code Execution' })).toBeFocused();
});

test('wild counter is visible after the second move and remains tied to the reducer event', async ({ page }, testInfo) => {
  mkdirSync(dir, { recursive: true });
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  const stage = page.getByTestId('phaser-stage');
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await expect(page.locator('.wild-counter')).toHaveCount(0);
  await page.getByRole('button', { name: 'Code Execution' }).click();
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await expect(page.locator('.wild-counter')).toContainText('TASK used Scope Shift!');
  await expect(page.locator('.wild-counter')).toContainText('Extra verification is required.');
  await page.screenshot({ path: dir + '/wild-counter-' + testInfo.project.name + '.png', fullPage: true });
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(noHorizontalOverflow).toBe(true);
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await expect(page.locator('.wild-counter')).toHaveCount(0);
});


test('decision prompt is complete when controls become actionable', async ({ page }) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', 'command');
  // Command phase must never expose clickable moves under half-typed narration.
  await expect(page.locator('.retro-dialogue p')).toContainText('Choose a move for Understand & plan.');
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', 'command');
  await expect(page.locator('.retro-dialogue p')).toContainText('Choose a move for Apply a solution.');
});

test('enemy counter leaves every battle command visible in a 390x844 portrait viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  const stage = page.getByTestId('phaser-stage');
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await page.getByRole('button', { name: 'Code Execution' }).click();
  await expect(stage).toHaveAttribute('data-phase', 'command');
  await expect(page.locator('.wild-counter')).toBeVisible();
  await expect(page.locator('.wild-counter')).toContainText('Scope Shift');
  await expect(page.locator('.retro-dialogue p')).toContainText('The problem changed');
  const bounds = await page.evaluate(() => ({
    pageHeight: document.documentElement.scrollHeight,
    pageWidth: document.documentElement.scrollWidth,
    viewportHeight: innerHeight,
    viewportWidth: innerWidth,
    menuBottom: document.querySelector('.command-panel')!.getBoundingClientRect().bottom,
  }));
  expect(bounds.pageWidth).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  expect(bounds.pageHeight).toBeLessThanOrEqual(bounds.viewportHeight + 8);
  expect(bounds.menuBottom).toBeLessThanOrEqual(bounds.viewportHeight);
  await page.screenshot({ path: dir + '/counter-fit-' + testInfo.project.name + '.png', fullPage: true });
});

test('difficulty defaults to medium, persists, and controls battle spoilers', async ({ page }) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await expect(page.getByRole('combobox', { name: 'Difficulty' })).toHaveValue('medium');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await expect(page.locator('.move-forecast')).toHaveCount(0);
  await expect(page.locator('.move-lesson')).toContainText('Break a difficult problem into smaller steps.');
  await expect(page.locator('.move-lesson')).not.toContainText('Fits this step');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('combobox', { name: 'Difficulty' }).selectOption('hard');
  await page.reload();
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await expect(page.getByRole('combobox', { name: 'Difficulty' })).toHaveValue('hard');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await expect(page.locator('.move-lesson')).toHaveCount(0);
  await expect(page.locator('.tactical-help')).toHaveCount(0);
  await expect(page.locator('.stage-intel')).not.toContainText('Break');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('combobox', { name: 'Difficulty' }).selectOption('easy');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await expect(page.locator('.move-forecast')).toHaveCount(4);
  await expect(page.locator('.move-lesson')).toContainText('Fits this step');
});
