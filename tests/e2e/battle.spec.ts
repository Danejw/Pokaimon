import { test, expect, type Page } from '@playwright/test';

async function startTask(page: Page) {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByText('A wild TASK appeared!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select GPT-6.2 Astra' })).toBeVisible();
}
async function summon(page: Page, model: string) {
  await page.getByRole('button', { name: 'Select ' + model }).click();
  await expect(page.getByRole('button', { name: /Deep Think|Max Reasoning|Extended Thinking/ }).first()).toBeVisible();
}
test('a wild encounter chooses the model after the trainer arrives and summons it', async ({ page }) => {
  await startTask(page);
  await expect(page.getByTestId('phaser-stage')).toBeVisible();
  await summon(page, 'GPT-6.2 Astra');
  await expect(page.getByText(/GO! GPT-6.2 Astra/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
});
test('model attacks resolve through the existing battle reducer, victory is saved', async ({ page }) => {
  await startTask(page);
  await summon(page, 'GPT-6.2 Astra');
  for (const move of ['Deep Think', 'Code Execution', 'Self-Correction', 'Self-Correction']) {
    await page.getByRole('button', { name: move }).click();
    await expect(page.getByRole('button', { name: move }).or(page.getByRole('heading', { name: 'VICTORY!' })).first()).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await page.getByRole('button', { name: /NEXT WILD ENCOUNTER/i }).click();
  await expect(page.getByText(/A wild .* appeared!/i).first()).toBeVisible();
});
test('wrong moves drain AP; retry restarts the encounter presentation', async ({ page }) => {
  await startTask(page);
  await summon(page, 'GPT-6.2 Astra');
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: 'Deep Research' }).click();
    if (i < 5) await expect(page.getByRole('button', { name: 'Deep Research' })).toBeEnabled();
  }
  await expect(page.getByRole('heading', { name: 'TRY AGAIN' })).toBeVisible();
  await page.getByRole('button', { name: /RETRY BATTLE/i }).click();
  await expect(page.getByRole('button', { name: 'Select GPT-6.2 Astra' })).toBeVisible();
});
test('each model has distinct available moves after its own summon', async ({ page }) => {
  for (const [model, move] of [
    ['GPT-6.2 Astra', 'Deep Think'], ['Grok 4.7', 'Max Reasoning'], ['Claude Fable 5.2', 'Extended Thinking'],
  ]) {
    await startTask(page);
    await summon(page, model);
    await expect(page.getByRole('button', { name: move })).toBeVisible();
  }
});
test('move controls use keyboard with arrow/WASD and Enter', async ({ page }) => {
  await startTask(page);
  await summon(page, 'GPT-6.2 Astra');
  const first = page.getByRole('button', { name: 'Deep Think' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Deep Research' })).toBeFocused();
  await page.keyboard.press('s');
  await expect(page.getByRole('button', { name: 'Self-Correction' })).toBeFocused();
  await page.keyboard.press('a');
  await expect(page.getByRole('button', { name: 'Code Execution' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(first).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Apply a solution/).first()).toBeVisible();
});
test('reduced motion and fast text do not block the encounter sequence', async ({ page }) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /SETTINGS/i }).click();
  await page.getByRole('checkbox', { name: 'Reduced motion' }).check();
  await page.getByRole('checkbox', { name: 'Sound' }).uncheck();
  await page.getByRole('combobox', { name: 'Text speed' }).selectOption('fast');
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /PLAY/i }).click();
  await expect(page.getByRole('button', { name: 'Select GPT-6.2 Astra' })).toBeVisible();
  await summon(page, 'GPT-6.2 Astra');
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(page.getByTestId('phaser-stage')).not.toHaveClass(/stage-hit/);
});
