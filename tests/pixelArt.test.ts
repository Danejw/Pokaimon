import { describe, expect, it } from 'vitest';
import { modelSprites, enemySprites, trainerSprite } from '../src/game/pixelArt';
import { handDrawnModels, handDrawnEnemies } from '../src/game/handDrawnSprites';

describe('clean, readable original pixel character art', () => {
  const everyone = [trainerSprite, ...Object.values(modelSprites), ...Object.values(enemySprites)];

  it('uses nine hand-designed pixel matrices without automatic noise or upscaling', () => {
    expect(everyone).toHaveLength(9);
    for (const art of everyone) {
      expect(art.pixelSize).toBe(3);
      const width = art.pixels[0].length;
      expect(width).toBeGreaterThanOrEqual(30);
      expect(width).toBeLessThanOrEqual(36);
      expect(art.pixels.length).toBeGreaterThanOrEqual(27);
      expect(art.pixels.length).toBeLessThanOrEqual(31);
      expect(art.pixels.every(row => row.length === width)).toBe(true);
      expect(width * art.pixelSize).toBeLessThanOrEqual(108);
      expect(art.pixels.length * art.pixelSize).toBeLessThanOrEqual(93);
      const symbols = new Set(art.pixels.join(''));
      symbols.delete('.');
      expect(symbols.size).toBeGreaterThanOrEqual(5);
      expect(symbols.size).toBeLessThanOrEqual(9);
      expect(art.pixels.join('')).not.toMatch(/[\uE000-\uF8FF0-9]/);
      for (const color of symbols) expect(art.palette[color]).toBeDefined();
    }
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
    expect(modelSprites).toBe(handDrawnModels);
    expect(enemySprites).toBe(handDrawnEnemies);
    expect(modelSprites.grok.pixels.join('')).not.toEqual(modelSprites.astra.pixels.join(''));
    expect(modelSprites.astra.pixels.join('')).not.toEqual(modelSprites.fable.pixels.join(''));
    expect(enemySprites.TASK.pixels.join('')).not.toEqual(enemySprites['MATH PROBLEM'].pixels.join(''));
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
