import { test, expect } from '@playwright/test';

async function task(page:import('@playwright/test').Page){
  await page.goto('./');await page.getByRole('button',{name:/PLAY/}).click();
  await page.getByRole('button',{name:'Challenge TASK'}).click();
  await page.getByRole('button',{name:/Select GPT-6.2 Astra/}).click();
}
test('win TASK, unlock BUG, and save progress',async({page})=>{
  await task(page);
  for(const name of ['Deep Think','Code Execution','Self-Correction','Self-Correction'])
    await page.getByRole('button',{name}).click();
  await expect(page.getByRole('heading',{name:'VICTORY!'})).toBeVisible();
  await page.getByRole('button',{name:/MORE CHALLENGES/}).click();
  await expect(page.getByRole('button',{name:'Challenge BUG'})).toBeEnabled();
  await page.reload();
  await page.getByRole('button',{name:/PLAY/}).click();
  await expect(page.getByRole('button',{name:'Challenge BUG'})).toBeEnabled();
});
test('wrong moves lose and retry works',async({page})=>{
  await task(page);
  for(let i=0;i<6;i++)await page.getByRole('button',{name:'Deep Research'}).click();
  await expect(page.getByRole('heading',{name:'TRY AGAIN'})).toBeVisible();
  await page.getByRole('button',{name:/RETRY BATTLE/}).click();
  await expect(page.getByRole('button',{name:'Deep Think'})).toBeVisible();
});
test('model selection shows capability coverage',async({page})=>{
  await page.goto('./');await page.getByRole('button',{name:/PLAY/}).click();
  await page.getByRole('button',{name:'Challenge TASK'}).click();
  await page.getByRole('button',{name:/Select Grok 4.7/}).click();
  await expect(page.getByRole('button',{name:'Max Reasoning'})).toBeVisible();
  await page.getByRole('button',{name:/CHALLENGES/}).click();
  await page.getByRole('button',{name:'Challenge TASK'}).click();
  await page.getByRole('button',{name:/Select Claude Fable 5.2/}).click();
  await expect(page.getByRole('button',{name:'Extended Thinking'})).toBeVisible();
});

test('keyboard arrow/WASD move focus and Enter execute a move',async({page})=>{
  await task(page);
  const first=page.getByRole('button',{name:'Deep Think'});
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button',{name:'Deep Research'})).toBeFocused();
  await page.keyboard.press('s');
  await expect(page.getByRole('button',{name:'Self-Correction'})).toBeFocused();
  await page.keyboard.press('a');
  await expect(page.getByRole('button',{name:'Code Execution'})).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(first).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Apply a solution/).first()).toBeVisible();
});
test('reduced motion and sound preferences persist during gameplay',async({page})=>{
  await page.goto('./');await page.getByRole('button',{name:/SETTINGS/}).click();
  await page.getByRole('checkbox',{name:'Sound'}).uncheck();
  await page.getByRole('checkbox',{name:'Reduced motion'}).check();
  await page.getByRole('combobox',{name:'Text speed'}).selectOption('fast');
  await page.getByRole('button',{name:/HOME/}).click();
  await page.getByRole('button',{name:/PLAY/}).click();
  await page.getByRole('button',{name:'Challenge TASK'}).click();
  await page.getByRole('button',{name:/Select GPT-6.2 Astra/}).click();
  await page.getByRole('button',{name:'Deep Think'}).click();
  await expect(page.getByTestId('phaser-stage')).not.toHaveClass(/stage-hit/);
});
