import { describe, expect, it } from 'vitest';
import { modelSprites, enemySprites, trainerSprite } from '../src/game/pixelArt';
import { refineSprite } from '../src/game/spriteDetail';
import { ultraDetailSprite } from '../src/game/ultraDetail';

describe('Pokaimon authored high-density pixel art', () => {
  it('keeps the initial 2x/3x detail masters readable and unchanged', () => {
    const base = { pixelSize: 4, palette: { K: 0x223344, A: 0x55aa99 },
      pixels: ['KAA', 'AAA'] };
    const first = refineSprite(base, 'astra');
    expect(first.pixels).toHaveLength(4);
    expect(first.pixels.every(row => row.length === 6)).toBe(true);
    expect(first.pixelSize).toBe(2);
    expect(first.pixels[0][0]).toBe('K');
    expect(base.pixels).toEqual(['KAA', 'AAA']);
  });

  it('adds 16x addressable pixels over the previous detailed lattice', () => {
    const master = { pixelSize: 4, palette: { K: 0x223344, A: 0x55aa99 },
      pixels: Array.from({ length: 19 }, () => 'A'.repeat(23)) };
    const previous = refineSprite(master, 'astra');
    const latest = ultraDetailSprite(previous, 'astra');
    expect(latest.pixels.length).toBe(previous.pixels.length * 4);
    expect(latest.pixels[0].length).toBe(previous.pixels[0].length * 4);
    expect(latest.pixels.length * latest.pixels[0].length)
      .toBe(previous.pixels.length * previous.pixels[0].length * 16);
    expect(latest.pixelSize).toBe(previous.pixelSize / 4);
    expect(latest.pixels.join('')).toMatch(/[0-9]/);
    expect(latest.pixels.join('')).toMatch(/[\uE100-\uE1FF]/);
    expect(master.pixels).toEqual(Array.from({ length: 19 }, () => 'A'.repeat(23)));
  });

  it('updates every character and enemy to the 16x higher-density artwork', () => {
    const all = [trainerSprite, ...Object.values(modelSprites), ...Object.values(enemySprites)];
    expect(all).toHaveLength(9);
    for (const art of all) {
      const width = art.pixels[0].length;
      const height = art.pixels.length;
      expect(width).toBeGreaterThanOrEqual(140);
      expect(height).toBeGreaterThanOrEqual(50);
      expect(art.pixels.every(row => row.length === width)).toBe(true);
      expect(art.pixelSize).toBeLessThanOrEqual(.5);
      expect(width * (art.pixelSize ?? 1)).toBeLessThanOrEqual(120);
      expect(height * (art.pixelSize ?? 1)).toBeLessThanOrEqual(105);
      const colors = new Set(art.pixels.join('').replaceAll('.', ''));
      expect(colors.size).toBeGreaterThanOrEqual(10);
      for (const char of colors) expect(art.palette[char]).toBeDefined();
      expect(art.pixels.join('')).toMatch(/[\uE100-\uE1FF]/);
    }
  });

  it('retains unique authored color details for all three playable companions', () => {
    expect(modelSprites.astra.pixels.join('')).not.toBe(modelSprites.grok.pixels.join(''));
    expect(modelSprites.fable.pixels.join('')).not.toBe(modelSprites.astra.pixels.join(''));
    for (const art of Object.values(modelSprites)) {
      expect(art.pixels.join('')).toMatch(/[0-9]/);
      expect(art.palette['0']).toBeDefined();
    }
  });
});
