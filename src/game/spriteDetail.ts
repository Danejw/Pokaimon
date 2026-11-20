/**
 * Hand-authored accents and material shading for original Pokaimon sprites.
 * Upscales the source pixel lattice into actual new artwork, rather than enlarging pixels.
 * The result is shared unchanged by Phaser and React's SVG portrait renderer.
 */
export interface SourcePixelArt {
  readonly pixels: readonly string[];
  readonly palette: Readonly<Record<string, number>>;
  readonly pixelSize?: number;
}
export type SpriteSubject =
  | 'trainer' | 'astra' | 'grok' | 'fable'
  | 'task' | 'bug' | 'research' | 'math' | 'hallucination';

const accents: Record<string, number> = {
  '0': 0xfffdf1, // warm specular glint
  '1': 0xffd57a, // sunlit metal / accents
  '2': 0x34405d, // small ink details
  '3': 0x75e8d4, // bright cyan
  '4': 0xf39cbb, // petal highlight
  '5': 0x9ab8ff, // sky blue
  '6': 0xa66b7b, // muted dark blush
  '7': 0x83ca86, // foliage / checkmark
  '8': 0xb5a5ed, // violet gleam
  '9': 0xffcda8, // peach light
};

function blend(a: number, b: number, weight: number): number {
  let result = 0;
  for (const shift of [16, 8, 0]) {
    const channel = (a >> shift) & 255;
    const other = (b >> shift) & 255;
    result |= Math.round(channel * (1 - weight) + other * weight) << shift;
  }
  return result;
}

type Stroke = [string, ...number[]];

/** Original character-specific embroidery, eyes, highlights and small material markings. */
const marks: Record<SpriteSubject, readonly Stroke[]> = {
  trainer: [
    ['1', 10,2, 13,2], ['0', 11,2], ['0', 7,4, 15,4],
    ['2', 8,7, 9,7], ['2', 13,7, 14,7], ['0', 8,6], ['9', 12,9],
    ['0', 9,11, 14,11], ['3', 8,12, 8,14], ['3', 15,12, 15,14],
    ['2', 11,13, 11,15], ['7', 7,15, 9,16], ['7', 14,16, 16,15],
    ['0', 6,18, 7,18], ['0', 13,18, 14,18],
  ],
  astra: [
    ['0', 10,1], ['1', 10,2, 10,3], ['5', 10,4, 11,5],
    ['3', 7,5, 9,4], ['3', 13,4, 15,5], ['0', 9,9], ['0', 14,9],
    ['2', 9,10], ['2', 14,10], ['4', 6,12, 7,12], ['4', 15,12, 16,12],
    ['3', 5,8, 6,6], ['3', 17,8, 16,6], ['0', 10,12, 12,12],
    ['1', 11,13], ['5', 8,15, 10,16], ['5', 13,16, 15,15],
    ['0', 6,7], ['0', 17,7],
  ],
  grok: [
    ['1', 5,1], ['1', 17,1], ['8', 6,3, 7,4], ['8', 16,3, 15,4],
    ['5', 10,5, 13,5], ['3', 10,8, 13,8], ['0', 9,9], ['0', 14,9],
    ['2', 9,10], ['2', 14,10], ['1', 10,12, 12,12],
    ['0', 11,13], ['5', 5,10, 6,12], ['5', 18,10, 17,12],
    ['8', 8,14, 9,15], ['8', 14,15, 15,14], ['0', 5,16], ['0', 17,16],
  ],
  fable: [
    ['9', 3,1, 3,3], ['9', 18,1, 18,3], ['4', 4,2], ['4', 17,2],
    ['1', 9,6, 12,6], ['0', 7,9], ['0', 17,9],
    ['2', 7,10], ['2', 17,10], ['4', 5,12], ['4', 19,12],
    ['6', 6,13, 9,13], ['6', 16,13, 19,13],
    ['9', 9,15, 11,16], ['9', 14,16, 16,15],
    ['0', 11,12], ['1', 12,14], ['9', 6,7], ['9', 18,7],
  ],
  task: [
    ['0', 7,2, 17,2], ['5', 5,4, 5,17], ['0', 6,5, 17,5],
    ['2', 7,7, 9,7], ['2', 14,7, 17,7], ['0', 9,8], ['0', 16,8],
    ['7', 9,12, 11,13, 13,11], ['7', 14,11, 17,11],
    ['5', 7,15, 17,15], ['5', 7,17, 13,17],
    ['1', 8,20, 16,20], ['0', 6,22], ['0', 19,22],
  ],
  bug: [
    ['0', 4,2], ['0', 17,2], ['6', 6,4, 8,5], ['6', 14,5, 16,4],
    ['4', 4,6, 8,6], ['4', 14,6, 18,6],
    ['0', 6,8], ['0', 16,8], ['2', 6,9], ['2', 16,9],
    ['0', 9,10, 13,10], ['6', 9,11, 13,11],
    ['4', 5,12, 7,12], ['4', 15,12, 17,12],
    ['0', 3,14], ['0', 19,14], ['6', 7,13, 9,13],
  ],
  research: [
    ['0', 6,1, 15,1], ['1', 15,3, 16,4],
    ['5', 6,5, 13,5], ['0', 9,6, 12,6],
    ['5', 6,8, 13,8], ['1', 6,10, 14,10],
    ['0', 5,12, 6,12], ['0', 13,12, 14,12],
    ['2', 6,13], ['2', 14,13], ['4', 8,14, 11,14],
    ['1', 7,15, 13,15],
  ],
  math: [
    ['0', 9,1], ['1', 8,2, 10,2],
    ['8', 6,5, 12,5], ['0', 5,6], ['0', 15,6],
    ['2', 6,8, 8,8], ['2', 14,8, 16,8],
    ['0', 7,9], ['0', 15,9],
    ['1', 9,10, 11,10], ['0', 10,9, 10,11],
    ['8', 6,12, 13,12], ['0', 5,13], ['0', 14,13],
  ],
  hallucination: [
    ['0', 8,2, 12,2], ['8', 5,5, 6,4], ['8', 15,4, 16,5],
    ['0', 7,7], ['0', 14,7], ['2', 8,8], ['2', 14,8],
    ['4', 7,10, 8,10], ['4', 13,10, 14,10],
    ['0', 9,11, 11,11], ['8', 6,12, 8,13],
    ['8', 13,13, 15,12], ['0', 10,14], ['0', 6,3],
  ],
};

/**
 * Paint a finer true-pixel sprite while preserving the source silhouette.
 * 4px sprites become 2px sprites at 2x width/height.
 * 3px sprites become 1px sprites at 3x width/height.
 */
export function refineSprite<T extends SourcePixelArt>(source: T, subject: SpriteSubject): T {
  const factor = source.pixelSize === 3 ? 3 : 2;
  const width = Math.max(...source.pixels.map(row => row.length));
  const height = source.pixels.length;
  const sourceRows = source.pixels.map(row => row.padEnd(width, '.'));
  const expanded: string[][] = Array.from({length: height * factor},
    () => Array<string>(width * factor).fill('.'));
  const palette: Record<string, number> = {...source.palette, ...accents};
  const materialSymbols = Object.keys(source.palette).filter(key => key !== 'K');
  const slots = 'abcdefghijklmnopqrstuvwxyz';
  const shading: Record<string, [string, string]> = {};
  materialSymbols.forEach((key, index) => {
    const light = slots[index * 2];
    const shade = slots[index * 2 + 1];
    if (!light || !shade) throw new Error('Sprite palette exhausted');
    shading[key] = [light, shade];
    palette[light] = blend(source.palette[key], 0xffffff, 0.28);
    palette[shade] = blend(source.palette[key], 0x233049, 0.23);
  });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = sourceRows[y][x];
      if (source.palette[key] === undefined) continue;
      const px = x * factor, py = y * factor;
      for (let dy = 0; dy < factor; dy++)
        for (let dx = 0; dx < factor; dx++) expanded[py + dy][px + dx] = key;

      if (key === 'K') continue;
      const [light, shade] = shading[key];
      const above = y > 0 ? sourceRows[y - 1][x] : '.';
      const below = y + 1 < height ? sourceRows[y + 1][x] : '.';
      const left = x > 0 ? sourceRows[y][x - 1] : '.';
      const right = x + 1 < width ? sourceRows[y][x + 1] : '.';
      // Material boundaries have directional highlights and shadow pixels.
      if (above !== key) expanded[py][px + Math.floor(factor / 2)] = light;
      if (left !== key) expanded[py + Math.floor(factor / 2)][px] = light;
      if (below !== key) expanded[py + factor - 1][px + factor - 1] = shade;
      if (right !== key) expanded[py + factor - 1][px + factor - 1] = shade;
      // Restrained internal texture avoids flat 2x2 blocks and checkerboard noise.
      if ((x * 7 + y * 11) % 9 === 0) expanded[py][px] = light;
      if ((x * 13 + y * 3) % 13 === 0) expanded[py + factor - 1][px] = shade;
    }
  }

  const plot = (x: number, y: number, color: string) => {
    if (x < 0 || y < 0 || x >= width * factor || y >= height * factor) return;
    if (expanded[y][x] !== '.') expanded[y][x] = color;
  };
  const stroke = (color: string, coords: readonly number[]) => {
    if (coords.length < 2) return;
    for (let i = 0; i + 1 < coords.length; i += 2) {
      const x = Math.round(coords[i] * factor);
      const y = Math.round(coords[i + 1] * factor);
      if (i === 0) plot(x, y, color);
      if (i + 3 >= coords.length) continue;
      const xx = Math.round(coords[i + 2] * factor);
      const yy = Math.round(coords[i + 3] * factor);
      const dx = Math.abs(xx - x), dy = Math.abs(yy - y);
      const steps = Math.max(dx, dy);
      for (let n = 0; n <= steps; n++)
        plot(Math.round(x + (xx - x) * n / Math.max(steps, 1)),
          Math.round(y + (yy - y) * n / Math.max(steps, 1)), color);
    }
  };
  for (const [color, ...coords] of marks[subject]) stroke(color, coords);

  return {
    ...source,
    pixelSize: (source.pixelSize ?? 4) / factor,
    palette,
    pixels: expanded.map(row => row.join('')),
  };
}
