import type { SourcePixelArt, SpriteSubject } from './spriteDetail';

/**
 * The second, genuinely higher-resolution art pass. The existing expressive 2x/3x
 * sprites are the masters; this introduces four *new* editable micro-pixels per axis
 * (16x addressable pixels versus the previous preview) at identical display bounds.
 *
 * Each subject gets hand-placed details in ORIGINAL coarse-cell coordinates.
 * New material highlights are intentionally sparse; no random pixel noise or filters.
 */
type Detail = readonly [color: string, x: number, y: number, width: number, height: number];
const motifs: Record<SpriteSubject, readonly Detail[]> = {
  trainer: [
    ['1', 8.5,1.28, 6.2,.22], ['0', 9.1,2.12, 1.2,.3],
    ['1', 14.15,3.02, 1.15,.24], ['0', 6.3,4.35, 11.15,.17],
    ['0', 7.7,6.32, 1.3,.43], ['0', 13.45,6.32, 1.3,.43],
    ['5', 8.06,6.33,.38,.25], ['5', 13.78,6.33,.38,.25],
    ['9', 10.15,7.8, 2.3,.35], ['2', 10.75,9.1,1.3,.22],
    ['0', 7.6,11.38,8.7,.23], ['3', 8.3,12.1,.25,3.4],
    ['3', 15.18,12.1,.25,3.4], ['1', 10.4,14.3,3.5,.35],
    ['2', 11.5,14.3,.38,1.9], ['0', 6.3,18.35,2.7,.35],
    ['0', 13.4,18.35,2.7,.35], ['9', 10.0,8.48,1.3,.32],
  ],
  astra: [
    ['0', 10.17,1.14,.85,.42], ['1', 9.84,2.07,1.26,.24],
    ['3', 7.15,5.12,3.2,.24], ['3', 12.6,5.12,3.0,.24],
    ['0', 7.3,9.11,2.0,1.4], ['0', 12.6,9.11,2.0,1.4],
    ['5', 8.26,9.48,.58,.65], ['5', 13.57,9.48,.58,.65],
    ['0', 8.42,9.49,.2,.25], ['0', 13.73,9.49,.2,.25],
    ['0', 9.65,12.72,3.6,.24], ['4', 5.78,12.14,1.1,.38],
    ['4', 15.5,12.14,1.1,.38], ['1', 10.65,13.1,1.6,.34],
    ['3', 5.34,7.2,.27,3.7], ['3', 16.4,7.2,.27,3.7],
    ['5', 8.2,15.4,5.2,.26], ['1', 10.0,16.15,2.5,.22],
  ],
  grok: [
    ['1', 5.34,1.13,.55,.4], ['1', 17.3,1.13,.55,.4],
    ['8', 6.08,3.22,.32,1.42], ['8', 16.57,3.22,.32,1.42],
    ['5', 8.2,5.6,6.1,.25], ['0', 8.1,8.64,2.4,1.42],
    ['0', 13.1,8.64,2.4,1.42], ['3', 9.02,9.0,.8,.5],
    ['3', 14.02,9.0,.8,.5], ['0', 9.42,9.0,.2,.22],
    ['0', 14.42,9.0,.2,.22], ['1', 10.45,12.16,2.55,.29],
    ['2', 11.0,12.58,1.55,.22], ['5', 5.2,9.5,.3,3.0],
    ['5', 17.8,9.5,.3,3.0], ['8', 8.4,14.16,6.1,.28],
    ['3', 10.72,15.4,1.3,.2], ['0', 4.42,16.8,2.2,.22],
  ],
  fable: [
    ['0', 3.15,1.06,.24,2.1], ['0', 18.22,1.06,.24,2.1],
    ['9', 2.3,1.5,1.7,.22], ['9', 17.5,1.5,1.7,.22],
    ['4', 3.4,2.24,.72,.55], ['4', 18.08,2.24,.72,.55],
    ['0', 7.2,9.26,1.45,1.46], ['0', 16.4,9.26,1.45,1.46],
    ['5', 7.74,9.4,.48,.56], ['5', 16.94,9.4,.48,.56],
    ['0', 7.84,9.4,.16,.2], ['0', 17.04,9.4,.16,.2],
    ['4', 5.63,12.32,1.3,.44], ['4', 18.2,12.32,1.3,.44],
    ['9', 9.0,13.24,5.65,.2], ['1', 11.26,13.65,1.25,.3],
    ['6', 8.6,14.6,6.3,.27], ['9', 7.12,15.12,2.5,.23],
    ['9', 15.2,15.12,2.3,.23],
  ],
  task: [
    ['0', 6.8,2.12,10.1,.23], ['5', 4.35,5.12,.32,12.1],
    ['0', 7.15,6.5,2.6,.33], ['0', 14.1,6.5,2.6,.33],
    ['5', 8.17,7.15,.32,.42], ['5', 15.17,7.15,.32,.42],
    ['0', 9.1,8.85,4.3,.2], ['7', 9.1,11.5,3.7,.37],
    ['7', 12.75,11.3,4.1,.32], ['0', 6.2,13.1,12.0,.13],
    ['5', 6.7,15.63,10.9,.28], ['5', 8.1,17.4,8.9,.24],
    ['0', 6.2,20.2,10.1,.24], ['1', 8.2,19.28,7.5,.25],
    ['2', 5.4,21.44,2.15,.28], ['2', 18.0,21.44,2.05,.28],
  ],
  bug: [
    ['1', 3.28,2.1,.47,.27], ['1', 17.65,2.1,.47,.27],
    ['4', 5.25,5.6,11.8,.24], ['0', 5.63,7.85,2.4,1.12],
    ['0', 14.62,7.85,2.4,1.12], ['5', 6.45,8.13,.35,.3],
    ['5', 15.42,8.13,.35,.3], ['0', 6.6,8.22,.13,.18],
    ['0', 15.57,8.22,.13,.18], ['6', 8.18,10.3,5.1,.23],
    ['4', 6.2,11.6,10.2,.25], ['0', 8.9,12.7,4.6,.22],
    ['6', 4.7,13.38,3.0,.2], ['6', 14.1,13.38,3.0,.2],
    ['9', 9.5,6.12,3.1,.2],
  ],
  research: [
    ['0', 6.3,1.43,9.4,.24], ['5', 5.6,4.87,10.4,.18],
    ['1', 14.9,3.3,1.1,.2], ['5', 6.18,6.13,8.0,.29],
    ['5', 6.18,7.12,8.0,.27], ['0', 5.68,8.6,10.1,.23],
    ['1', 6.25,9.38,8.8,.21], ['1', 6.25,10.2,8.8,.21],
    ['0', 5.35,12.15,2.8,.55], ['0', 12.6,12.15,2.8,.55],
    ['5', 6.11,12.28,.7,.27], ['5', 13.27,12.28,.7,.27],
    ['4', 8.3,13.63,2.1,.29], ['5', 6.0,14.65,8.2,.18],
    ['0', 8.45,15.2,2.15,.18],
  ],
  math: [
    ['1', 8.15,1.38,2.9,.3], ['8', 6.3,4.3,7.4,.3],
    ['0', 6.23,7.22,2.5,1.3], ['0', 12.48,7.22,2.5,1.3],
    ['5', 6.8,7.48,.47,.34], ['5', 13.05,7.48,.47,.34],
    ['0', 9.35,9.48,1.55,.33], ['0', 10.0,9.25,.3,1.65],
    ['1', 10.15,10.38,1.55,.28], ['8', 5.4,11.1,9.5,.22],
    ['0', 4.7,12.5,10.9,.25], ['1', 6.1,13.24,2.2,.26],
    ['1', 12.0,13.24,2.2,.26],
  ],
  hallucination: [
    ['0', 7.3,2.32,5.6,.22], ['8', 5.7,4.2,10.2,.27],
    ['0', 6.52,6.65,2.2,1.4], ['0', 13.26,6.65,2.2,1.4],
    ['5', 7.35,7.02,.35,.35], ['5', 14.06,7.02,.35,.35],
    ['0', 7.5,7.2,.13,.17], ['0', 14.22,7.2,.13,.17],
    ['4', 7.0,9.68,7.8,.32], ['0', 9.38,10.5,2.3,.22],
    ['8', 5.52,11.6,10.0,.28], ['8', 6.4,12.8,8.2,.26],
    ['0', 8.1,13.7,4.7,.19], ['1', 9.5,14.2,2.0,.18],
  ],
};

function tint(color: number, light: boolean): number {
  let result = 0;
  for (const shift of [16, 8, 0]) {
    const n = color >> shift & 255;
    result |= Math.round(light ? n * .77 + 255 * .23 : n * .81 + 20 * .19) << shift;
  }
  return result;
}

export function ultraDetailSprite<T extends SourcePixelArt>(source: T, subject: SpriteSubject): T {
  const scale = 4;
  const width = Math.max(...source.pixels.map(row => row.length));
  const height = source.pixels.length;
  const rows = source.pixels.map(row => row.padEnd(width, '.'));
  const colors = Array.from(new Set(rows.join(''))).filter(symbol => source.palette[symbol] !== undefined);
  const palette: Record<string, number> = { ...source.palette };
  const variants = new Map<string, readonly [string, string]>();
  colors.forEach((symbol, index) => {
    // Private-use BMP characters are safe single-character palette keys.
    const bright = String.fromCharCode(0xe100 + index * 2);
    const shadow = String.fromCharCode(0xe101 + index * 2);
    palette[bright] = tint(source.palette[symbol], true);
    palette[shadow] = tint(source.palette[symbol], false);
    variants.set(symbol, [bright, shadow]);
  });
  const refined = Array.from({ length: height * scale },
    () => Array<string>(width * scale).fill('.'));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const symbol = rows[y][x];
      if (source.palette[symbol] === undefined) continue;
      const [bright, shadow] = variants.get(symbol)!;
      const px = x * scale;
      const py = y * scale;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) refined[py + dy][px + dx] = symbol;

      // Real directional micro-pixel lighting. No global checkerboard/dither.
      if (y === 0 || rows[y - 1][x] !== symbol) {
        for (let dx = 1; dx < scale - 1; dx++) refined[py][px + dx] = bright;
      }
      if (x === 0 || rows[y][x - 1] !== symbol) {
        refined[py + 1][px] = bright;
      }
      if (y + 1 >= height || rows[y + 1][x] !== symbol) {
        refined[py + scale - 1][px + 2] = shadow;
      }
      if (x + 1 >= width || rows[y][x + 1] !== symbol) {
        refined[py + 2][px + scale - 1] = shadow;
      }
    }
  }

  // Fixed authored embroidery / eyes / crests. Coordinates refer to the
  // ORIGINAL pixel-art master, so these remain readable and maintainable.
  const pixelSize = (source.pixelSize ?? 4) / scale;
  const originalCell = source.pixelSize === 1 ? 3 : 4;
  const units = originalCell / pixelSize;
  let detailedPixels = 0;
  for (const [color, x, y, w, h] of motifs[subject]) {
    const x0 = Math.round(x * units), y0 = Math.round(y * units);
    const x1 = Math.round((x + w) * units), y1 = Math.round((y + h) * units);
    for (let iy = Math.max(0, y0); iy < Math.min(refined.length, Math.max(y0 + 1, y1)); iy++) {
      for (let ix = Math.max(0, x0); ix < Math.min(refined[0].length, Math.max(x0 + 1, x1)); ix++) {
        if (refined[iy][ix] === '.') continue; // never alter silhouette
        refined[iy][ix] = color;
        detailedPixels++;
      }
    }
  }
  if (!detailedPixels) throw new Error('Authored details fell outside sprite: ' + subject);
  return {
    ...source,
    pixelSize,
    palette,
    pixels: refined.map(row => row.join('')),
  };
}
