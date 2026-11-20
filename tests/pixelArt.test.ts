import { describe, expect, it } from 'vitest';
import { modelSprites, enemySprites, trainerSprite } from '../src/game/pixelArt';
import { refineSprite } from '../src/game/spriteDetail';

describe('high-detail original pixel art', () => {
  it('repaints actual source pixels on at least twice the resolution in both axes', () => {
    const base = { pixelSize: 4, palette: { K: 0x223344, A: 0x55aa99 }, pixels: ['KAA', 'AAA'] };
    const fine = refineSprite(base, 'astra');
    expect(fine.pixels).toHaveLength(4);
    expect(fine.pixels.every(row => row.length === 6)).toBe(true);
    expect(fine.pixelSize).toBe(2);
    expect(fine.pixels.join('')).toMatch(/[a-z]/);
    expect(fine.pixels[0][0]).toBe('K');
    expect(base.pixels).toEqual(['KAA', 'AAA']); // no source mutation
  });

  it('repaints the small original 3px sprites on a 3x lattice', () => {
    const base = { pixelSize: 3, palette: { K: 0x223344, A: 0x55aa99 }, pixels: ['KA', 'AA'] };
    const fine = refineSprite(base, 'trainer');
    expect(fine.pixels).toHaveLength(6);
    expect(fine.pixels[0]).toHaveLength(6);
    expect(fine.pixelSize).toBe(1);
  });

  it('shares palette-complete, finely shaded creatures with consistent display bounds', () => {
    const artSet = [trainerSprite, ...Object.values(modelSprites), ...Object.values(enemySprites)];
    expect(artSet).toHaveLength(9);
    for (const art of artSet) {
      const width = art.pixels[0].length;
      expect(width).toBeGreaterThanOrEqual(35);
      expect(art.pixels.length).toBeGreaterThanOrEqual(28);
      expect(art.pixels.every(row => row.length === width)).toBe(true);
      expect(art.pixelSize).toBeLessThanOrEqual(2);
      expect(width * (art.pixelSize ?? 3)).toBeLessThanOrEqual(120);
      expect(art.pixels.length * (art.pixelSize ?? 3)).toBeLessThanOrEqual(105);
      const colors = new Set(art.pixels.join('').replaceAll('.', ''));
      expect(colors.size).toBeGreaterThanOrEqual(7);
      for (const key of colors) expect(art.palette[key]).toBeDefined();
    }
  });

  it('keeps companions visually distinct in the same source used by battle and portraits', () => {
    expect(modelSprites.astra.pixels.join('')).not.toEqual(modelSprites.grok.pixels.join(''));
    expect(modelSprites.grok.pixels.join('')).not.toEqual(modelSprites.fable.pixels.join(''));
    for (const model of Object.values(modelSprites))
      expect(model.pixels.join('')).toMatch(/[0-9]/);
  });
});
