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
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByText(/Go! GPT-6.2 Astra/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase', 'command');
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-model', 'astra');
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

test('switching companions uses a turn without spending AP and keeps the battle playable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startTask(page);
  await summon(page, 'GPT-6.2 Astra');
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(page.getByRole('button', { name: 'Code Execution' })).toBeVisible();
  await page.getByRole('button', { name: /SWITCH \(1 TURN\)/ }).click();
  await expect(page.getByRole('group', { name: 'Switch companion' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Switch to Grok 4.7' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Grok 4.7' }).click();
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-model','grok');
  await expect(page.getByRole('button', { name: 'Code Review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toHaveCount(0);
  await expect(page.locator('.hero-status')).toContainText('5/6');
  await expect(page.locator('.command-header')).toContainText('TURN 2');
  await page.getByRole('button', { name: 'Code Review' }).click();
  await expect(page.getByRole('button', { name: 'Code Review' })).toBeVisible();
  await page.getByRole('button', { name: 'Code Review' }).click();
  await expect(page.getByRole('button', { name: /SWITCH \(1 TURN\)/ })).toBeVisible();
  await page.getByRole('button', { name: /SWITCH \(1 TURN\)/ }).click();
  await page.getByRole('button', { name: 'Switch to GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Self-Correction' })).toBeVisible();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await page.screenshot({ path: 'test-results/visual/squad-win-' + testInfo.project.name + '.png', fullPage:true });
});

test('switch menu stays legible and selectable on compact phones and desktop', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name.includes('mobile') ? 360 : 1280, height: testInfo.project.name.includes('mobile') ? 800 : 900 });
  await startTask(page);
  await summon(page, 'GPT-6.2 Astra');
  await page.getByRole('button', { name: /SWITCH \(1 TURN\)/ }).click();
  await expect(page.getByRole('button', { name: 'Switch to Grok 4.7' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Switch to Claude Fable 5.2' })).toBeVisible();
  const horizontal = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(horizontal).toBeLessThanOrEqual(1);
  await page.screenshot({ path:'test-results/visual/squad-switch-' + testInfo.project.name + '.png', fullPage:true });
  await page.getByRole('button', { name: /MOVES/i }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
});

test('code review blocks a telegraphed counter on its second turn', async ({ page }, testInfo) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select Grok 4.7' }).click();
  await expect(page.getByRole('button', { name: 'Max Reasoning' })).toBeVisible();
  await page.getByRole('button', { name: 'Max Reasoning' }).click();
  await expect(page.locator('.battle-intent')).toContainText('Scope Shift');
  await page.getByRole('button', { name: 'Code Review' }).click();
  await expect(page.locator('.wild-counter')).toContainText('blocked');
  await page.screenshot({ path: 'test-results/visual/guard-counter-' + testInfo.project.name + '.png', fullPage:true });
  await page.getByRole('button', { name: 'Code Review' }).click();
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
});

test('research followed by verification earns a clear simulated combo reward', async ({ page }, testInfo) => {
  await page.goto('./?encounter=research');
  await page.getByRole('button', { name: /PLAY/i }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Deep Think' })).toBeVisible();
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await expect(page.getByRole('button', { name: 'Deep Research' })).toBeVisible();
  await page.getByRole('button', { name: 'Deep Research' }).click();
  await expect(page.getByRole('button', { name: 'Self-Correction' })).toBeVisible();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await expect(page.locator('.battle-combo')).toContainText('RESEARCH + VERIFY');
  await page.screenshot({ path: 'test-results/visual/evidence-combo-' + testInfo.project.name + '.png', fullPage:true });
});

test('ModelDex and selected squad persist across reload and control battle selection', async ({ page }, testInfo) => {
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: 'MODELDEX' }).click();
  await expect(page.getByRole('heading', { name: 'ModelDex' })).toBeVisible();
  await expect(page.locator('.dex-entry')).toHaveCount(3);
  await expect(page.getByText('MOVES DISCOVERED')).toBeVisible();
  await page.screenshot({ path:'test-results/visual/modeldex-'+testInfo.project.name+'.png', fullPage:true });
  await page.getByRole('button', { name: 'EDIT TEAM' }).click();
  await expect(page.getByRole('heading', { name: 'Build your team' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Team Grok 4.7' }).uncheck();
  await page.getByRole('checkbox', { name: 'Team Claude Fable 5.2' }).uncheck();
  await page.getByRole('button', { name: 'SAVE TEAM' }).click();
  await expect(page.getByRole('status')).toContainText('TEAM SAVED');
  await page.screenshot({ path:'test-results/visual/team-'+testInfo.project.name+'.png', fullPage:true });
  await page.reload();
  await page.getByRole('button', { name: 'TEAM' }).click();
  await expect(page.getByRole('checkbox', { name: 'Team GPT-6.2 Astra' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Team Grok 4.7' })).not.toBeChecked();
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /^▶ PLAY$/ }).click();
  await expect(page.getByRole('button', { name: 'Select GPT-6.2 Astra' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select Grok 4.7' })).toHaveCount(0);
});

test('three saved clears unlock an alternate combat loadout', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('pokaimon:progress:v2', JSON.stringify({
    schema:2,cleared:['task','bug','research'],teamIds:['astra','grok','fable'],
    discoveredMoves:[],winsByModel:{astra:2},useAlternateLoadout:false,
  })));
  await page.goto('./?encounter=task');
  await page.getByRole('button', { name: 'TEAM' }).click();
  await expect(page.getByText('TACTICAL LOADOUT UNLOCKED')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Alternate Astra loadout' }).check();
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: 'MODELDEX' }).click();
  const astra=page.locator('.dex-entry').first();
  await astra.getByText('FOUR CAPABILITY MOVES').click();
  await expect(astra).toContainText('Code Review');
  await expect(astra).not.toContainText('Code Execution');
  await page.screenshot({ path:'test-results/visual/mastery-'+testInfo.project.name+'.png', fullPage:true });
  await page.getByRole('button', { name: /HOME/i }).click();
  await page.getByRole('button', { name: /^▶ PLAY$/ }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await expect(page.getByRole('button', { name: 'Code Review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Code Execution' })).toHaveCount(0);
});

test('team builder prevents a softlocked single-model squad', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'TEAM' }).click();
  await page.getByRole('checkbox', { name: 'Team GPT-6.2 Astra' }).uncheck();
  await page.getByRole('checkbox', { name: 'Team Claude Fable 5.2' }).uncheck();
  await page.getByRole('button', { name: 'SAVE TEAM' }).click();
  await expect(page.getByRole('status')).toContainText('cannot solve every current wild task');
  await page.reload();
  await page.getByRole('button', { name: 'TEAM' }).click();
  await expect(page.getByRole('checkbox', { name: 'Team GPT-6.2 Astra' })).toBeChecked();
});

test('campaign missions unlock serially after a real win and remain saved on reload', async ({ page }, testInfo) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'CAMPAIGN' }).click();
  await expect(page.getByRole('heading', { name: 'Trainer campaign' })).toBeVisible();
  await expect(page.locator('.campaign-chapter')).toHaveCount(3);
  await expect(page.getByRole('button', { name: /Patch Sprinter/ })).toBeDisabled();
  await page.screenshot({ path:'test-results/visual/campaign-locked-'+testInfo.project.name+'.png', fullPage:true });
  await page.getByRole('button', { name: /First Assignment/ }).click();
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  for (const move of ['Deep Think','Code Execution','Self-Correction','Self-Correction']) {
    await expect(page.getByRole('button', { name: move })).toBeVisible();
    await page.getByRole('button', { name: move }).click();
  }
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await page.getByRole('button', { name: /CHAPTER SELECT/ }).click();
  await expect(page.getByRole('button', { name: /Patch Sprinter/ })).toBeEnabled();
  await expect(page.locator('.campaign-progress')).toContainText('1/9');
  await page.screenshot({ path:'test-results/visual/campaign-unlocked-'+testInfo.project.name+'.png', fullPage:true });
  await page.reload();
  await page.getByRole('button', { name: 'CAMPAIGN' }).click();
  await expect(page.getByRole('button', { name: /Patch Sprinter/ })).toBeEnabled();
});

test('workshop boss changes phase visibly with original creature art and can be defeated', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('pokaimon:progress:v3', JSON.stringify({
    schema:3,cleared:['task'],teamIds:['astra','grok','fable'],
    discoveredMoves:[],winsByModel:{astra:1},useAlternateLoadout:false,
    missionsCleared:['workshop-task','workshop-rival'],
  })));
  await page.goto('./');
  await page.getByRole('button', { name: 'CAMPAIGN' }).click();
  await page.getByRole('button', { name: /Scope Giant/ }).click();
  await expect(page.locator('.enemy-status')).toContainText('SCOPE GIANT');
  await page.getByRole('button', { name: 'Select GPT-6.2 Astra' }).click();
  await page.getByRole('button', { name: 'Deep Think' }).click();
  await page.getByRole('button', { name: 'Code Execution' }).click();
  await expect(page.locator('.boss-intent')).toContainText('FINAL AUDIT');
  await expect(page.getByTestId('phaser-stage')).toHaveAttribute('data-phase','command');
  await page.screenshot({ path:'test-results/visual/boss-phase-'+testInfo.project.name+'.png', fullPage:true });
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await page.getByRole('button', { name: 'Self-Correction' }).click();
  await expect(page.getByRole('heading', { name: 'VICTORY!' })).toBeVisible();
  await expect(page.locator('.boss-result')).toContainText('FINAL AUDIT');
  await page.getByRole('button', { name: /CHAPTER SELECT/ }).click();
  await expect(page.getByText('THE WORKSHOP EMBLEM EARNED')).toBeVisible();
  await expect(page.getByRole('button', { name: /Source Hunt/ })).toBeEnabled();
});

test('rival punishes repeating a tactic without hiding the outcome', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('pokaimon:progress:v3', JSON.stringify({
    schema:3,cleared:['task'],teamIds:['astra','grok','fable'],
    discoveredMoves:[],winsByModel:{astra:1},useAlternateLoadout:false,
    missionsCleared:['workshop-task'],
  })));
  await page.goto('./');
  await page.getByRole('button', { name: 'CAMPAIGN' }).click();
  await page.getByRole('button', { name: /Patch Sprinter/ }).click();
  await page.getByRole('button', { name: 'Select Grok 4.7' }).click();
  await page.getByRole('button', { name: 'Max Reasoning' }).click();
  await page.getByRole('button', { name: 'Max Reasoning' }).click();
  await expect(page.locator('.wild-counter')).toContainText('anticipated that repeated reasoning move');
  await page.screenshot({ path:'test-results/visual/rival-counter-'+testInfo.project.name+'.png', fullPage:true });
});
