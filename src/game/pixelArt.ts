import * as Phaser from 'phaser';

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

export const enemySprites:Record<string,PixelArt> = {
  'TASK':task,'BUG':bug,'RESEARCH REQUEST':research,'MATH PROBLEM':math,'HALLUCINATION':hallucination,
};
export const modelSprites:Record<ModelId,PixelArt> = {astra,grok,fable};
export const trainerSprite = trainer;

/** Draw a transparent, fixed-size sprite on a Phaser Graphics canvas. */
export function paintSprite(graphics:Phaser.GameObjects.Graphics,art:PixelArt,pose:ModelPose='idle'):void {
  graphics.clear();
  const unit=art.pixelSize??3;
  const width=Math.max(...art.pixels.map(row=>row.length));
  const x0=-Math.floor(width*unit/2);
  const y0=-art.pixels.length*unit;
  for(let row=0;row<art.pixels.length;row++){
    const pixels=art.pixels[row];
    for(let col=0;col<pixels.length;col++){
      const symbol=pixels[col];
      if(symbol==='.' || symbol===' ')continue;
      const color=art.palette[symbol];
      if(color===undefined)continue;
      // Pixel perfect, no image interpolation or runtime texture downloads.
      graphics.fillStyle(color);
      graphics.fillRect(x0+col*unit,y0+row*unit,unit,unit);
    }
  }
  // Pose overlays add expressive features while preserving each creature's silhouette.
  if(pose==='attack'){
    graphics.fillStyle(0xffffff);graphics.fillRect(-unit*3,y0+unit*5,unit*2,unit);
    graphics.fillStyle(0xf8db74);graphics.fillRect(unit*2,y0+unit*3,unit*2,unit*2);
  }
  if(pose==='charge'){
    graphics.fillStyle(0xfff3b1);graphics.fillRect(-3,y0-7,6,6);
  }else if(pose==='victory'){
    graphics.fillStyle(0xffec95);graphics.fillRect(-22,y0-9,7,7);graphics.fillRect(19,y0-6,6,6);
    graphics.fillRect(-12,y0-17,5,5);graphics.fillRect(9,y0-20,5,5);
  }else if(pose==='hurt'){
    graphics.fillStyle(0xff7d86);graphics.fillRect(-3,y0-7,6,6);
    graphics.fillRect(-unit*3,y0+unit*7,unit*2,unit);
  }
}
export function createPixelCharacter(scene:Phaser.Scene,art:PixelArt,x:number,y:number):{container:Phaser.GameObjects.Container,paint:(pose?:ModelPose)=>void}{
  const graphic=scene.add.graphics();
  const container=scene.add.container(x,y,[graphic]);
  const paint=(pose:ModelPose='idle')=>paintSprite(graphic,art,pose);
  paint();
  return {container,paint};
}
