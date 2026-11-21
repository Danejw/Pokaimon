import { describe, expect, it } from 'vitest';
import { modelSprites, enemySprites, trainerSprite } from '../src/game/pixelArt';
import { handDrawnModels, handDrawnEnemies } from '../src/game/handDrawnSprites';

describe('clean, readable original pixel character art', () => {
  const everyone = [trainerSprite, ...Object.values(modelSprites), ...Object.values(enemySprites)];

  it('keeps all 18 original handheld sprites crisp without automatic noise or upscaling', () => {
    expect(everyone).toHaveLength(18);
    const bossArt = new Set(['SCOPE GIANT','FALSE SIGNAL','ADAPTIVE TRIAL','HALLUCINATION HYDRA','REGRESSION GOLEM','SCOPE SHIFTER'].map(name=>enemySprites[name]));
    for (const art of everyone) {
      expect(art.pixelSize).toBe(3);
      const isBoss=bossArt.has(art);
      const width = art.pixels[0].length;
      expect(width).toBeGreaterThanOrEqual(30);
      expect(width).toBeLessThanOrEqual(isBoss?42:36);
      expect(art.pixels.length).toBeGreaterThanOrEqual(27);
      expect(art.pixels.length).toBeLessThanOrEqual(art === trainerSprite ? 38 : isBoss?36:31);
      expect(art.pixels.every(row => row.length === width)).toBe(true);
      expect(width * art.pixelSize).toBeLessThanOrEqual(isBoss?126:108);
      expect(art.pixels.length * art.pixelSize).toBeLessThanOrEqual(art === trainerSprite ? 114 : isBoss?108:93);
      const symbols = new Set(art.pixels.join(''));
      symbols.delete('.');
      expect(symbols.size).toBeGreaterThanOrEqual(5);
      expect(symbols.size).toBeLessThanOrEqual(art === trainerSprite ? 15 : 9);
      expect(art.pixels.join('')).not.toMatch(/[\uE000-\uF8FF0-9]/);
      for (const color of symbols) expect(art.palette[color]).toBeDefined();
    }
  });

  it('keeps the original trainer visually distinct with a detailed outfit and human proportions', () => {
    const trainer = trainerSprite;
    expect(trainer.pixelSize).toBe(3);
    expect(trainer.pixels).toHaveLength(38);
    expect(trainer.pixels.every(row => row.length === 32)).toBe(true);
    expect(trainer.pixels[4]).toContain('R'); // cap crown
    expect(trainer.pixels[4]).toContain('T'); // unique teal cap insignia
    expect(trainer.pixels[12]).toContain('H'); // visible hair
    expect(trainer.pixels[12]).toContain('S'); // skin/face
    expect(trainer.pixels[22]).toContain('B'); // distinctly blue jacket sleeves
    expect(trainer.pixels[22]).toContain('G'); // backpack side pouch
    expect(trainer.pixels[24]).toContain('W'); // light shirt
    expect(trainer.pixels[33]).toContain('J'); // separated pant legs
    expect(trainer.pixels[36]).toContain('W'); // contrasting sneakers
    expect(trainer.pixels[31]).toContain('.'); // visible arm / leg separation
    expect(trainer.pixels[37][19]).toBe('K'); // separated shoes
  });

  it('provides a larger expressive face on Grok and Math Problem', () => {
    const grok = modelSprites.grok;
    const math = enemySprites['MATH PROBLEM'];
    expect(grok.pixels[13].slice(10, 26)).toContain('K');
    expect(grok.pixels[14].slice(10, 26)).toContain('W');
    expect(math.pixels[18].slice(10, 26)).toContain('K');
    expect(math.pixels[19].slice(10, 26)).toContain('W');
    expect(grok.pixels.join('').split('W').length).toBeGreaterThan(12);
    expect(math.pixels.join('').split('W').length).toBeGreaterThan(12);
    expect(grok.pixels[1].includes('Y')).toBe(true); // antenna details
    expect(math.pixels[10].includes('Y')).toBe(true); // math + crest
  });

  it('renders identical character source art in battle and the party guide', () => {
    for(const [id,art] of Object.entries(handDrawnModels))expect(modelSprites[id]).toBe(art);
    expect(enemySprites).toBe(handDrawnEnemies);
    expect(modelSprites.grok.pixels.join('')).not.toEqual(modelSprites.astra.pixels.join(''));
    expect(modelSprites.astra.pixels.join('')).not.toEqual(modelSprites.fable.pixels.join(''));
    expect(enemySprites.TASK.pixels.join('')).not.toEqual(enemySprites['MATH PROBLEM'].pixels.join(''));
    for (const name of ['SCOPE GIANT','FALSE SIGNAL','ADAPTIVE TRIAL','HALLUCINATION HYDRA','REGRESSION GOLEM','SCOPE SHIFTER'])
      expect(enemySprites[name].pixels.join('')).not.toEqual(enemySprites.TASK.pixels.join(''));
    expect(new Set(['SCOPE GIANT','FALSE SIGNAL','ADAPTIVE TRIAL','HALLUCINATION HYDRA','REGRESSION GOLEM','SCOPE SHIFTER'].map(name=>enemySprites[name].pixels.join(''))).size).toBe(6);
  });

  it('keeps clean borders and transparent empty space', () => {
    for (const art of everyone) {
      expect(art.pixels[0][0]).toBe('.');
      expect(art.pixels.at(-1)?.at(-1)).toBe('.');
      expect(art.palette.K).toBeDefined();
      const outlineCount = art.pixels.join('').split('K').length - 1;
      expect(outlineCount).toBeGreaterThan(40);
    }
  });
});
