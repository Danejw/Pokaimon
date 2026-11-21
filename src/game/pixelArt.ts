import * as Phaser from 'phaser';
import { handDrawnModels, handDrawnEnemies, handDrawnTrainer, type PixelDrawing } from './handDrawnSprites';
import { spriteCanvas } from './spriteRaster';

/**
 * The same original hand-authored sprites power Phaser battle and React's
 * model portraits. Keep real art in handDrawnSprites.ts, not automatic filters.
 */
export type ModelId = 'astra' | 'grok' | 'fable';
export type ModelPose = 'idle' | 'charge' | 'attack' | 'victory' | 'hurt';
export type PixelArt = PixelDrawing;

export const enemySprites: Record<string, PixelArt> = handDrawnEnemies;
export const modelSprites: Record<string, PixelArt> = handDrawnModels;
/** Original generic sprite used when a new catalog model has no authored art yet. */
export const fallbackModelSprite: PixelArt = {
  pixelSize: 3,
  palette: { K:0x293d4c, B:0x597e9c, L:0x9ec4d5, W:0xfaf6de, E:0x63dfb2 },
  pixels: [
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBBLLLLBBK...',
    '..KBLWWWWWWLBK..',
    '..KBLWKKWWKLBK..',
    '..KBLWKKWWKLBK..',
    '..KBLWWWWWWLBK..',
    '..KBLWEEEEWLBK..',
    '..KBLWWWWWWLBK..',
    '...KBLWWWWLBK...',
    '....KBBBBBBK....',
    '.....KKKKKK.....',
    '......K..K......',
    '......K..K......',
    '................',
  ].flatMap(row => {
    const doubled = [...row].map(pixel => pixel + pixel).join('');
    return [doubled, doubled];
  }),
};
export function getModelSprite(modelId:string): PixelArt {
  return modelSprites[modelId] ?? fallbackModelSprite;
}
export const trainerSprite: PixelArt = handDrawnTrainer;

// Cached texture per sprite and pose. The characters have clean 3px pixels
// and fewer than ~1,200 source pixels each, instead of tens of thousands.
const textureIds = new WeakMap<PixelArt, number>();
let nextTextureId = 0;

function textureFor(scene: Phaser.Scene, art: PixelArt, pose: ModelPose): string {
  let id = textureIds.get(art);
  if (id === undefined) {
    id = ++nextTextureId;
    textureIds.set(art, id);
  }
  const key = 'pokaimon-original-sprite-' + id + '-' + pose;
  if (!scene.textures.exists(key)) {
    const bitmap = spriteCanvas(art, pose);
    scene.textures.addCanvas(key, bitmap);
  }
  return key;
}

export function createPixelCharacter(
  scene: Phaser.Scene, art: PixelArt, x: number, y: number,
): { container: Phaser.GameObjects.Container; paint: (pose?: ModelPose) => void } {
  const image = scene.add.image(0, 0, textureFor(scene, art, 'idle'))
    .setOrigin(0.5, 1)
    .setScale(art.pixelSize);
  const container = scene.add.container(x, y, [image]);
  const paint = (pose: ModelPose = 'idle') => image.setTexture(textureFor(scene, art, pose));
  return { container, paint };
}
