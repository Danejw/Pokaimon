import * as Phaser from 'phaser';
import { refineSprite } from './spriteDetail';
import { ultraDetailSprite } from './ultraDetail';
import { spriteCanvas } from './spriteRaster';

/**
 * Original game-only pixel creatures. All source art is readable and editable here.
 * No scanned, scraped or copied franchise sprites or company mascot images.
 * One character's poses share its outline and palette, so animated states remain consistent.
 */
export type ModelId = 'astra' | 'grok' | 'fable';
export type ModelPose = 'idle' | 'charge' | 'attack' | 'victory' | 'hurt';
export interface PixelArt { pixels: readonly string[]; palette: Record<string, number>; pixelSize?: number; }
const ink = 0x2e3049;

const trainer: PixelArt = {
  pixelSize: 3,
  palette: { K: ink, R: 0xd64c42, W: 0xfff5d2, H: 0x3e3a4b, S: 0xf1bd87, G: 0x52aa72, D: 0x28624d, B: 0x70c5c2, L: 0xf6f6e7 },
  pixels: [
    '.......KKKKKKKK.........',
    '......KRRRRRRRRK........',
    '.....KRRRWWWWRRRK.......',
    '....KRRRRRWWRRRRRK......',
    '....KKKKKKKKKKKKKKKK....',
    '......HHHSSSSSHH........',
    '.....HHHSSSSSSSH........',
    '.....HSSSSKKSSSH........',
    '.....HSSSSSSSSH.........',
    '.....KKKSSSSSSK.........',
    '...KKGGGKKKKKGGKK.......',
    '..KGGGGGLLLLLGGGGK......',
    '..KGGGGDLLLLLDDGGK......',
    '.KGGGGDDLLLLLDDGGK......',
    '.KGGGGDDLLLLLDDGGK......',
    '..KGGGGDDDDDGGGGK.......',
    '...KGGGGKKKKGGGK........',
    '....KBBBK..KBBBK........',
    '....KBBBK..KBBBK........',
    '....KBBBK..KBBBK........',
    '....KKKKK..KKKKK........',
  ],
};

const astra: PixelArt = {
  pixelSize: 4,
  palette: {K:ink, A:0x5bc5bc, B:0xa9f7e0, C:0xecfff0, D:0x448c9a, E:0xf5acb7, F:0xfde4a1, G:0x7d9cf0},
  pixels:[
    '.........KKK.........',
    '........KFFFK........',
    '........KGGGK........',
    '.....KKKDBBDKKK......',
    '...KKABBBBBBBAKK.....',
    '..KABBBBBBBBBBBAK....',
    '.KABBBBBBBBBBBBBAK...',
    '.KABBBCCCCCCCBBBAK...',
    'KABBBCCCCCCCCCCBBAK..',
    'KABBCCCKKCCKKCCBBAK.',
    'KABBCCC KKCC KKCBBAK.'.replaceAll(' ','C'),
    'KABBCCCCCCCCCCCBBAK..',
    'KABBCCEECCCCEECCBBAK.',
    '.KABBCCCCKKCCCCBBAK..',
    '.KABBCCCCCCCCCCBBAK..',
    '..KABBBBBBBBBBBBAK...',
    '...KABBBDDDDBBBAK....',
    '..KAKKKK....KKKAK....',
    '..KK............KK....',
  ],
};
const grok: PixelArt = {
  pixelSize: 4,
  palette: {K:ink, A:0x6d61bd, B:0xb29aef, C:0xe3d6ff, D:0x6ae9e8, E:0xf9c56c, F:0x6d5b92, G:0x6a66b8},
  pixels:[
    '....KKK........KKK....',
    '....KEK........KEK....',
    '....KAK........KAK....',
    '.....KAKKKKKKKKAK.....',
    '...KKAAAAAAAAAAAKK....',
    '..KABBBBBBBBBBBBBAK...',
    '.KABBBBBBBBBBBBBBBAK..',
    '.KABBBCCCCCCCCCCBBAK..',
    '.KABBCCDDDDDDDDCCBBAK.',
    'KABBCCDDKKDDKKDDCCBAK.',
    'KABBCCDDDDDDDDDDCCBAK.',
    '.KABBBCCCCCCCCCCBBAK..',
    '.KABBBBBEEEEBBBBBBAK..',
    '..KABBBBBBBBBBBBBAK...',
    '...KAAAAGGGGAAAAK....',
    '...KKKKA....AKKKK.....',
    '...KGGGK....KGGGK.....',
    '...KKKKK....KKKKK.....',
  ],
};
const fable: PixelArt = {
  pixelSize: 4,
  palette: {K:ink, A:0xbf734f, B:0xf3ad79, C:0xffe6bf, D:0xed8f6a, E:0xe99fac, F:0x6d4f6c, G:0xffffff},
  pixels:[
    '..KKK............KKK...',
    '.KBBBK..........KBBBK..',
    '.KBCBK..........KBCBK..',
    '.KBBBK..........KBBBK..',
    '..KBBKKKKKKKKKKKBBK...',
    '..KABBBBBBBBBBBBBAK...',
    '.KABBBBBBBBBBBBBBBAK..',
    'KABBBCCCCCCCCCCCCBBAK.',
    'KABBCCCCCCCCCCCCCCBAK.',
    'KABBCCKKCCCCCCKKCCBAK.',
    'KABBCCKKCCCCCCKKCCBAK.',
    'KABBCCCCCCCCCCCCCCBAK.',
    '.KABBCCEECCEECCBBAK..',
    '.KABBCCCCFFCCCCBBAK...',
    '..KABBBBBBBBBBBBAK....',
    '...KABBBBBBBBBBAK.....',
    '...KAAAKKKKKKAAAK.....',
    '..KAKKK......KKKAK....',
    '..KK............KK.....',
  ],
};
const task: PixelArt = {
  pixelSize: 3,
  palette: {K:ink,W:0xfff9e9,P:0xd5d9e2,L:0x8c91a5,G:0x54c286,R:0xd94a52,Y:0xffd35f},
  pixels:[
    '......KKKKKKKKKKKKKK......',
    '.....KPPPPPPPPPPPPWK......',
    '....KPPPPPPPPPPPPWWK......',
    '...KKKKKKKKKKKKKKKKKKK.....',
    '...KWWWWWWWWWWWWWWWWK.....',
    '...KWWWWWWWWWWWWWWWWK.....',
    '...KWKKWWWWWKKWWWWWWK.....',
    '...KWWKWWWWWKWWWWWWWK.....',
    '...KWWWWKKKWWWWWWWWWK.....',
    '...KWWWWWWWWWWWWWWWWK.....',
    '...KWKKWWWWWWWWWWWWWK.....',
    '...KWKWGGGKKKKKKKWWWK.....',
    '...KWKKWWWWWWWWWWWWWK.....',
    '...KWWWWWWWWWWWWWWWWK.....',
    '...KWKKWWWWWWWWWWWWWK.....',
    '...KWKWLLLLLLLLLWWWWK.....',
    '...KWKKWWWWWWWWWWWWWK.....',
    '...KWWWWWWWWWWWWWWWWK.....',
    '...KKKKKKKKKKKKKKKKKK.....',
    '.....KPPPPPPPPPPPPK.......',
    '....KKKKKKKKKKKKKKKK......',
    '.....KLLK.......KLLK......',
    '.....KLLK.......KLLK......',
    '......KK.........KK.......',
  ],
};
const bug: PixelArt = {
  pixelSize: 4, palette:{K:ink,R:0xe47a87,L:0xffb0ba,D:0x924e7b,W:0xfff4e0},
  pixels:[
    '...KK............KK...',
    '..KDDK..........KDDK..',
    '...KDK..........KDK...',
    '....KKKKKKKKKKKKKK....',
    '..KKRRRRRRRRRRRRRRKK..',
    '.KRLLLLLLLLLLLLLLLLRK.',
    'KRLLLLLLLLLLLLLLLLLLRK',
    'KRLLLKKKLLLLKKKLLLLRK',
    'KRLLLKWKLLLLKWKLLLLRK',
    'KRLLLLLLLLLLLLLLLLLLRK',
    'KRLLLLLKKKKLLLLLLLLRK',
    '.KRLLLLLLLLLLLLLLLLRK.',
    '..KKRRRRRRRRRRRRRRKK..',
    'KDKKDKDKKKKKKDKDKKDK',
    'KDK..KDK....KDK..KDK',
    'KK....KK....KK....KK.',
  ],
};
const research: PixelArt = {
  pixelSize:4,palette:{K:ink,W:0xfff9e7,L:0x91b6d9,P:0xdbe8fc,Y:0xf9c367,R:0xe87e79},
  pixels:[
    '.....KKKKKKKKKKK.....',
    '....KWWWWWWWWWWK.....',
    '...KWWWWWWWWWWWWK....',
    '..KKKKKKKKKKKKKKKK...',
    '..KWWWLLLLLLLWWWWK...',
    '..KWLLLPPPPPLLLWWK...',
    '..KWLLLPPPPPLLLWWK...',
    '..KWWWWWWWWWWWWWWK...',
    '..KWKKKKKKKKKKKWWK...',
    '..KWKYYYYYYYYYYWWK...',
    '..KWKKKKKKKKKKKWWK...',
    '..KWWWWWWWWWWWWWWK...',
    '..KWWWKKKWWKKKWWWK...',
    '..KWWWKRKWWKRKWWWK...',
    '..KWWWWWWWWWWWWWWK...',
    '..KKKKKKKKKKKKKKKK...',
    '....KK........KK.....',
  ],
};
const math: PixelArt = {
  pixelSize:4,palette:{K:ink,L:0xd7cbff,P:0x9f87e4,W:0xffffff,Y:0xfad477},
  pixels:[
    '........KKK........',
    '.......KYYYK.......',
    '......KPPPPPK......',
    '.....KPPPPPPPK.....',
    '....KPPPPPPPPPK....',
    '...KPLLLLLLLLLPK...',
    '..KPLLLLLLLLLLLPK..',
    '.KPLLLLKKLLKKLLLPK.',
    'KPLLLLLKKLLKKLLLLPK',
    'KPLLLLLLLLLLLLLLLPK',
    'KPLLLLLLKKLLLLLLLPK',
    'KPLLLLLLLLLLLLLLLPK',
    'KKKKKKKKKKKKKKKKKKK',
    '....KKK.......KKK...',
  ],
};
const hallucination:PixelArt = {
  pixelSize:4,palette:{K:ink,W:0xf7eeff,L:0xc6b6eb,P:0x8476b4,R:0xe49cb0},
  pixels:[
    '.......KKKKKK........',
    '.....KKWWWWWWKK......',
    '....KWWWWWWWWWWK.....',
    '...KWWWLLLLLLWWWK....',
    '..KWWWLLLLLLLLWWWK...',
    '.KWWWLLLLLLLLLLWWWK..',
    '.KWWWLKKLLLLKKLWWWK..',
    '.KWWWLKKLLLLKKLWWWK..',
    '.KWWWLLLLLLLLLLWWWK..',
    '..KWWWLLRRRRLLWWWK...',
    '..KWWWLLLLLLLLWWWK...',
    '...KWWWLLLLLLWWWK....',
    '....KWWWLLLLWWWK.....',
    '.....KKWWWWWWKK......',
    '.....KPPKKPPK........',
    '......KK..KK.........',
  ],
};

// The previous 2x/3x masters are refined another 4x per axis (16x addressable
// pixel count versus the previous preview). On-screen footprints stay constant.
export const enemySprites:Record<string,PixelArt> = {
  'TASK':ultraDetailSprite(refineSprite(task, 'task'), 'task'),
  'BUG':ultraDetailSprite(refineSprite(bug, 'bug'), 'bug'),
  'RESEARCH REQUEST':ultraDetailSprite(refineSprite(research, 'research'), 'research'),
  'MATH PROBLEM':ultraDetailSprite(refineSprite(math, 'math'), 'math'),
  'HALLUCINATION':ultraDetailSprite(refineSprite(hallucination, 'hallucination'), 'hallucination'),
};
export const modelSprites:Record<ModelId,PixelArt> = {
  astra:ultraDetailSprite(refineSprite(astra, 'astra'), 'astra'),
  grok:ultraDetailSprite(refineSprite(grok, 'grok'), 'grok'),
  fable:ultraDetailSprite(refineSprite(fable, 'fable'), 'fable'),
};
export const trainerSprite = ultraDetailSprite(refineSprite(trainer, 'trainer'), 'trainer');

/**
 * Phaser draws one cached canvas texture per character/pose. A 160+ pixel-wide
 * authored lattice would otherwise create tens of thousands of Graphics nodes.
 * Texture keys are local to the current Phaser Game; all screens share the art.
 */
const textureIds = new WeakMap<PixelArt, number>();
let nextTextureId = 0;
function textureFor(scene: Phaser.Scene, art: PixelArt, pose: ModelPose): string {
  let id = textureIds.get(art);
  if (id === undefined) {
    id = ++nextTextureId;
    textureIds.set(art, id);
  }
  const key = 'pokaimon-hires-' + id + '-' + pose;
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, spriteCanvas(art, pose));
  return key;
}

export function createPixelCharacter(
  scene: Phaser.Scene, art: PixelArt, x: number, y: number,
): { container: Phaser.GameObjects.Container; paint: (pose?: ModelPose) => void } {
  const image = scene.add.image(0, 0, textureFor(scene, art, 'idle'))
    .setOrigin(.5, 1)
    .setScale(art.pixelSize ?? 3);
  const container = scene.add.container(x, y, [image]);
  const paint = (pose: ModelPose = 'idle') => image.setTexture(textureFor(scene, art, pose));
  return { container, paint };
}
