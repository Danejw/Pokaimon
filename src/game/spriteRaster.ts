import type { SourcePixelArt } from './spriteDetail';

/**
 * A small cached Canvas bitmap for a single original sprite definition.
 * Phaser textures and React portraits are generated from these exact pixels.
 * Avoids tens of thousands of SVG nodes and Graphics commands on mobile.
 */
export type SpriteExpression = 'idle' | 'charge' | 'attack' | 'victory' | 'hurt';

const canvases = new WeakMap<SourcePixelArt, Map<SpriteExpression, HTMLCanvasElement>>();
const urls = new WeakMap<SourcePixelArt, string>();

export function spriteCanvas(art: SourcePixelArt, expression: SpriteExpression = 'idle'): HTMLCanvasElement {
  const cache = canvases.get(art) ?? new Map<SpriteExpression, HTMLCanvasElement>();
  if (!canvases.has(art)) canvases.set(art, cache);
  const previous = cache.get(expression);
  if (previous) return previous;

  const width = Math.max(...art.pixels.map(row => row.length));
  const height = art.pixels.length;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Pokaimon pixel sprite requires Canvas 2D');

  const bitmap = ctx.createImageData(width, height);
  const out = bitmap.data;
  for (let y = 0; y < height; y++) {
    const row = art.pixels[y];
    for (let x = 0; x < row.length; x++) {
      const color = art.palette[row[x]];
      if (color === undefined) continue;
      const i = (y * width + x) * 4;
      out[i] = color >> 16 & 255;
      out[i + 1] = color >> 8 & 255;
      out[i + 2] = color & 255;
      out[i + 3] = 255;
    }
  }
  ctx.putImageData(bitmap, 0, 0);

  // Distinct art-state overlays, also painted in the same true micro-pixel grid.
  // Phaser changes these cached images at the animation boundaries.
  if (expression !== 'idle') {
    const unit = Math.max(1, Math.round(Math.min(width, height) / 60));
    const draw = (color: string, x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(width * x), Math.round(height * y),
        Math.max(unit, Math.round(width * w)), Math.max(unit, Math.round(height * h)));
    };
    if (expression === 'charge') {
      draw('#fff1a8', .47,.05,.07,.018);
      draw('#fffdf0', .51,.09,.035,.025);
      draw('#fff1a8', .31,.38,.055,.018);
    } else if (expression === 'attack') {
      draw('#ffffff', .37,.39,.07,.023);
      draw('#ffd46e', .59,.28,.06,.042);
      draw('#f7a1c0', .28,.58,.05,.02);
    } else if (expression === 'victory') {
      draw('#fff1ac', .19,.20,.045,.026);
      draw('#fff5d6', .78,.16,.04,.025);
      draw('#ffdd7b', .45,.09,.035,.035);
    } else if (expression === 'hurt') {
      draw('#ff818e', .45,.14,.055,.026);
      draw('#ff818e', .36,.4,.085,.022);
    }
  }
  cache.set(expression, canvas);
  return canvas;
}

export function spriteImageUrl(art: SourcePixelArt): string {
  const prior = urls.get(art);
  if (prior) return prior;
  const url = spriteCanvas(art).toDataURL('image/png');
  urls.set(art, url);
  return url;
}
