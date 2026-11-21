/**
 * Pokaimon's original character sprite sheets.
 *
 * These are deliberately composed on a modest 3px grid, with authored shapes,
 * large facial features, and restricted palettes. There are NO filters,
 * procedural dithering, subdivision passes or synthesized "extra detail".
 *
 * The first visual reference pair is Grok and Math Problem. Every other
 * character follows the same thick-outline / light-face / three-tone system.
 * The resulting art is consumed identically by Phaser and React portraits.
 */
export interface PixelDrawing {
  readonly pixels: readonly string[];
  readonly palette: Record<string, number>;
  readonly pixelSize: number;
}

type Band = readonly [y: number, left: number, right: number];

class Painter {
  private readonly cells: string[][];
  constructor(
    readonly width: number,
    readonly height: number,
    readonly palette: Record<string, number>,
  ) {
    this.cells = Array.from({length: height}, () => Array<string>(width).fill('.'));
  }
  rect(key: string, x: number, y: number, w: number, h: number): this {
    if (!(key in this.palette)) throw new Error('Unmapped pixel color: ' + key);
    for (let row = Math.max(0, y); row < Math.min(this.height, y + h); row++)
      for (let col = Math.max(0, x); col < Math.min(this.width, x + w); col++)
        this.cells[row][col] = key;
    return this;
  }
  bands(key: string, bands: readonly Band[]): this {
    for (const [y, left, right] of bands)
      this.rect(key, left, y, right - left + 1, 1);
    return this;
  }
  finish(): PixelDrawing {
    return {
      pixelSize: 3,
      palette: this.palette,
      pixels: this.cells.map(row => row.join('')),
    };
  }
}

/** Bold back-view purple robot, two obvious antennae, large teal face visor. */
function grok(): PixelDrawing {
  const p = new Painter(36, 30, {
    K:0x2d3048, D:0x554978, M:0x7d6bb8, L:0xbba7e5,
    C:0xe4d5fa, T:0x77e3db, W:0xfdf5e4, Y:0xfbd079,
  });
  p.bands('K', [
    [0,8,11],[0,24,27],[1,7,11],[1,24,28],[2,8,11],[2,24,27],
    [3,8,12],[3,23,27],[4,9,26],[5,7,28],[6,5,30],[7,4,31],
    [8,3,32],[9,3,32],[10,2,33],[11,2,33],[12,2,33],
    [13,1,34],[14,1,34],[15,1,34],[16,1,34],[17,1,34],
    [18,1,34],[19,2,33],[20,2,33],[21,3,32],[22,4,31],
    [23,5,30],[24,7,28],[25,9,26],
    [26,7,14],[26,21,28],[27,7,14],[27,21,28],
    [28,8,14],[28,21,27],
  ]);
  // Iconic dual gold-tipped antennas.
  p.rect('Y',9,1,2,1).rect('Y',25,1,2,1);
  p.rect('M',9,3,2,2).rect('M',25,3,2,2);
  p.bands('D',[[5,10,25],[6,7,28],[7,6,29],[8,5,30],
    [9,4,31],[10,3,32],[11,3,32],[12,3,32],
    [13,2,33],[14,2,33],[15,2,33],[16,2,33],
    [17,2,33],[18,2,33],[19,3,32],[20,3,32],
    [21,4,31],[22,5,30],[23,7,28],[24,9,26]]);
  p.bands('M',[[6,10,25],[7,8,27],[8,7,28],[9,6,29],
    [10,5,30],[11,4,31],[12,4,31],[13,4,31],
    [14,3,32],[15,3,32],[16,3,32],[17,4,31],
    [18,4,31],[19,5,30],[20,5,30],[21,7,28],[22,8,27]]);
  p.bands('L',[[8,10,24],[9,8,27],[10,7,28],[11,7,28],
    [12,6,29],[13,6,29],[14,6,29],[15,6,29],
    [16,6,29],[17,6,29],[18,7,28],[19,8,27]]);
  // Face visor is a single solid shape, not a noisy scattering of pixels.
  p.rect('K',7,11,22,10).rect('T',8,12,20,8);
  p.rect('C',9,12,18,2).rect('L',9,18,18,1);
  // Eyes: separate large ivory shapes, dark pupils, one glint apiece.
  p.rect('K',10,13,6,5).rect('K',20,13,6,5);
  p.rect('W',11,14,4,3).rect('W',21,14,4,3);
  p.rect('D',13,14,2,3).rect('D',21,14,2,3);
  p.rect('W',13,14,1,1).rect('W',21,14,1,1);
  p.rect('K',14,19,8,1).rect('D',15,20,6,1);
  // Distinct cheek plates and a tidy central chest badge.
  p.rect('C',5,17,2,3).rect('C',29,17,2,3);
  p.rect('K',15,23,6,2).rect('Y',16,23,4,1);
  p.rect('M',8,26,6,1).rect('M',22,26,6,1);
  p.rect('D',9,27,4,1).rect('D',23,27,4,1);
  return p.finish();
}

/** Purple mathematical wizard, tall tiered hat, visible + crest and big eyes. */
function math(): PixelDrawing {
  const p = new Painter(36, 31, {
    K:0x303047, D:0x75619f, P:0xa78acb, L:0xd7c2f2,
    W:0xfbf5df, C:0xffe0ac, Y:0xf6c766, E:0x544776,
  });
  p.bands('K', [
    [0,16,19],[1,15,20],[2,14,21],[3,13,22],[4,12,23],
    [5,11,24],[6,10,25],[7,9,26],[8,8,27],[9,7,28],
    [10,6,29],[11,6,29],[12,5,30],[13,4,31],[14,3,32],
    [15,3,32],[16,2,33],[17,2,33],[18,1,34],[19,1,34],
    [20,1,34],[21,1,34],[22,1,34],[23,2,33],[24,3,32],
    [25,4,31],[26,6,29],[27,8,27],
    [28,9,14],[28,21,26],[29,10,14],[29,21,25],
  ]);
  p.bands('D', [
    [2,16,19],[3,15,20],[4,14,21],[5,13,22],
    [6,12,23],[7,11,24],[8,10,25],[9,9,26],
    [10,8,27],[11,7,28],[12,7,28],[13,6,29],
    [14,5,30],[15,4,31],[16,4,31],[17,3,32],
    [18,3,32],[19,2,33],[20,2,33],[21,2,33],
    [22,2,33],[23,3,32],[24,4,31],[25,6,29],[26,8,27]]);
  p.bands('P',[[3,16,19],[4,15,20],[5,14,21],[6,13,22],
    [7,12,23],[8,11,24],[9,10,25],[10,9,26],
    [11,8,27],[12,8,27],[13,7,28],[14,6,29],
    [15,5,30],[16,5,30],[17,4,31],[18,4,31],
    [19,4,31],[20,4,31],[21,4,31],[22,4,31],[23,5,30],[24,6,29]]);
  p.bands('L',[[6,14,21],[7,13,22],[8,12,23],[9,11,24],
    [10,10,25],[11,9,26],[12,9,26],[13,8,27],
    [14,7,28],[15,7,28],[16,6,29],[17,6,29],[18,6,29],
    [19,6,29],[20,6,29],[21,6,29],[22,7,28]]);
  // Math identity: a yellow plus and forehead band.
  p.rect('Y',17,6,2,7).rect('Y',14,9,8,2);
  p.rect('K',15,14,6,1).rect('P',16,15,4,1);
  // Cream face mask with separated eyes and a readable smile.
  p.rect('K',6,17,24,8).rect('W',7,18,22,6);
  p.rect('K',10,18,6,5).rect('K',20,18,6,5);
  p.rect('W',11,19,4,3).rect('W',21,19,4,3);
  p.rect('E',13,19,2,3).rect('E',21,19,2,3);
  p.rect('W',13,19,1,1).rect('W',21,19,1,1);
  p.rect('C',8,22,2,1).rect('C',26,22,2,1);
  p.rect('K',15,23,6,1).rect('D',16,24,4,1);
  p.rect('P',10,28,4,1).rect('P',22,28,4,1);
  return p.finish();
}

/** Teal reasoning creature with a glowing thought crest and calm eyes. */
function astra(): PixelDrawing {
  const p = new Painter(36, 30, {
    K:0x2c3547,D:0x36858d,M:0x57beb9,L:0xa8efdc,
    C:0xe8fff0,W:0xfff7dc,P:0xf4adbb,Y:0xffd37f,
  });
  p.bands('K',[[0,16,19],[1,15,20],[2,15,20],[3,16,19],
    [4,12,23],[5,9,26],[6,7,28],[7,5,30],[8,4,31],
    [9,3,32],[10,3,32],[11,2,33],[12,2,33],
    [13,1,34],[14,1,34],[15,1,34],[16,1,34],
    [17,1,34],[18,2,33],[19,2,33],[20,3,32],
    [21,4,31],[22,5,30],[23,7,28],[24,9,26],
    [25,10,15],[25,20,25],[26,10,15],[26,20,25],
    [27,11,14],[27,21,24]]);
  p.rect('Y',17,1,2,1).rect('D',16,3,4,2);
  p.bands('D',[[5,12,23],[6,9,26],[7,7,28],[8,6,29],
    [9,5,30],[10,4,31],[11,4,31],[12,3,32],
    [13,3,32],[14,3,32],[15,3,32],[16,3,32],
    [17,3,32],[18,4,31],[19,4,31],[20,5,30],
    [21,6,29],[22,7,28],[23,9,26]]);
  p.bands('M',[[7,10,25],[8,8,27],[9,7,28],[10,6,29],
    [11,5,30],[12,5,30],[13,4,31],[14,4,31],
    [15,4,31],[16,4,31],[17,4,31],[18,5,30],
    [19,6,29],[20,7,28],[21,8,27]]);
  p.bands('L',[[9,10,25],[10,8,27],[11,7,28],
    [12,7,28],[13,6,29],[14,6,29],[15,6,29],
    [16,6,29],[17,6,29],[18,7,28],[19,8,27]]);
  p.rect('C',9,11,18,10);
  p.rect('K',10,13,6,5).rect('K',20,13,6,5);
  p.rect('W',11,14,4,3).rect('W',21,14,4,3);
  p.rect('D',13,14,2,3).rect('D',21,14,2,3);
  p.rect('W',13,14,1,1).rect('W',21,14,1,1);
  p.rect('P',7,18,2,1).rect('P',27,18,2,1);
  p.rect('K',15,19,6,1).rect('D',16,20,4,1);
  p.rect('D',14,23,8,1).rect('Y',16,23,4,1);
  p.rect('M',11,25,4,1).rect('M',21,25,4,1);
  return p.finish();
}

/** Warm fox-like storyteller, long pointed ears, broad cream muzzle. */
function fable(): PixelDrawing {
  const p = new Painter(36, 30, {
    K:0x3e3447,D:0x995a52,M:0xd28761,L:0xf6b982,
    C:0xffe9c4,W:0xfff9e9,P:0xeea1ab,Y:0xf6d176,
  });
  p.bands('K',[
    [0,5,10],[0,25,30],[1,4,10],[1,25,31],
    [2,4,11],[2,24,31],[3,5,12],[3,23,30],
    [4,6,13],[4,22,29],[5,6,29],
    [6,5,30],[7,4,31],[8,3,32],[9,2,33],
    [10,2,33],[11,1,34],[12,1,34],[13,1,34],
    [14,1,34],[15,1,34],[16,1,34],[17,1,34],
    [18,2,33],[19,2,33],[20,3,32],[21,4,31],
    [22,5,30],[23,7,28],[24,9,26],
    [25,8,14],[25,21,27],[26,8,14],[26,21,27],
    [27,9,13],[27,22,26]]);
  p.rect('M',6,1,4,2).rect('M',26,1,4,2);
  p.rect('P',7,2,2,2).rect('P',27,2,2,2);
  p.bands('D',[[5,8,27],[6,7,28],[7,6,29],[8,5,30],
    [9,4,31],[10,3,32],[11,3,32],[12,2,33],
    [13,2,33],[14,2,33],[15,2,33],[16,2,33],
    [17,2,33],[18,3,32],[19,4,31],[20,5,30],
    [21,6,29],[22,8,27]]);
  p.bands('M',[[7,8,27],[8,7,28],[9,6,29],
    [10,5,30],[11,4,31],[12,4,31],[13,4,31],
    [14,4,31],[15,4,31],[16,4,31],[17,4,31],
    [18,5,30],[19,6,29],[20,7,28],[21,9,26]]);
  p.bands('L',[[9,10,25],[10,8,27],[11,7,28],
    [12,6,29],[13,6,29],[14,6,29],[15,6,29],
    [16,6,29],[17,7,28],[18,8,27]]);
  p.rect('C',8,13,20,9).rect('C',10,11,16,3);
  p.rect('K',10,13,6,5).rect('K',20,13,6,5);
  p.rect('W',11,14,4,3).rect('W',21,14,4,3);
  p.rect('D',13,14,2,3).rect('D',21,14,2,3);
  p.rect('W',13,14,1,1).rect('W',21,14,1,1);
  p.rect('P',7,18,2,2).rect('P',27,18,2,2);
  p.rect('K',17,19,2,2).rect('D',14,21,8,1);
  p.rect('Y',16,23,4,1);
  p.rect('M',9,25,5,1).rect('M',22,25,5,1);
  return p.finish();
}

/** Animated checklist, with readable checkboxes and a stern expression. */
function task(): PixelDrawing {
  const p = new Painter(34, 31, {
    K:0x303647,D:0x8a94a5,M:0xcfd6e1,L:0xecf0f4,
    W:0xfffdf0,T:0x59b994,Y:0xffd77f,P:0xf3a4ac,
  });
  p.bands('K',[[1,8,27],[2,6,29],[3,5,30],
    [4,4,31],[5,3,31],[6,3,31],[7,3,31],
    [8,3,31],[9,3,31],[10,3,31],[11,3,31],
    [12,3,31],[13,3,31],[14,3,31],[15,3,31],
    [16,3,31],[17,3,31],[18,3,31],[19,3,31],
    [20,3,31],[21,3,31],[22,3,31],[23,3,31],
    [24,3,31],[25,4,30],[26,5,29],[27,7,27],
    [28,7,12],[28,22,27],[29,8,12],[29,22,26]]);
  p.rect('M',7,2,21,3).rect('D',6,4,23,2);
  p.rect('W',5,7,25,18).rect('L',6,7,23,2);
  p.rect('D',6,10,5,1).rect('D',21,10,7,1);
  p.rect('K',8,12,6,4).rect('K',20,12,6,4);
  p.rect('W',9,13,4,2).rect('W',21,13,4,2);
  p.rect('K',11,13,2,2).rect('K',21,13,2,2);
  p.rect('P',7,17,3,1).rect('P',26,17,2,1);
  p.rect('K',14,19,8,1).rect('K',16,20,4,1);
  p.rect('K',7,22,3,3).rect('T',8,23,1,1);
  p.rect('T',12,23,12,1).rect('D',12,25,14,1);
  p.rect('D',7,28,5,1).rect('D',22,28,5,1);
  return p.finish();
}

/** Blushing pink bug: big eyes, upright antennae and visible tiny feet. */
function bug(): PixelDrawing {
  const p = new Painter(36, 30, {
    K:0x443548,D:0x994f7a,M:0xdf7e9b,L:0xffb6c3,
    W:0xfff5e9,P:0xfbd57b,Y:0xa8dfdb,
  });
  p.bands('K',[[0,8,11],[0,24,27],[1,8,11],[1,24,27],
    [2,9,12],[2,23,26],[3,10,25],[4,9,26],
    [5,7,28],[6,5,30],[7,4,31],[8,3,32],
    [9,2,33],[10,1,34],[11,1,34],[12,1,34],
    [13,1,34],[14,1,34],[15,1,34],[16,1,34],
    [17,1,34],[18,1,34],[19,2,33],[20,3,32],
    [21,4,31],[22,5,30],[23,8,27],
    [24,4,10],[24,14,21],[24,25,31],
    [25,4,10],[25,14,21],[25,25,31],
    [26,5,9],[26,15,20],[26,26,30]]);
  p.rect('P',9,1,2,1).rect('P',25,1,2,1);
  p.bands('D',[[5,10,25],[6,8,27],[7,6,29],[8,5,30],
    [9,4,31],[10,3,32],[11,2,33],[12,2,33],
    [13,2,33],[14,2,33],[15,2,33],[16,2,33],
    [17,2,33],[18,2,33],[19,3,32],[20,4,31],
    [21,6,29]]);
  p.bands('M',[[7,9,26],[8,7,28],[9,6,29],
    [10,5,30],[11,4,31],[12,4,31],[13,4,31],
    [14,4,31],[15,4,31],[16,4,31],[17,4,31],
    [18,5,30],[19,7,28]]);
  p.bands('L',[[9,10,25],[10,8,27],[11,7,28],
    [12,6,29],[13,6,29],[14,6,29],[15,6,29],
    [16,6,29],[17,7,28]]);
  p.rect('K',9,11,7,6).rect('K',20,11,7,6);
  p.rect('W',10,12,5,4).rect('W',21,12,5,4);
  p.rect('D',13,13,2,3).rect('D',21,13,2,3);
  p.rect('W',13,13,1,1).rect('W',21,13,1,1);
  p.rect('P',7,18,3,1).rect('P',26,18,3,1);
  p.rect('K',15,19,6,1).rect('D',16,20,4,1);
  p.rect('L',9,22,18,1);
  p.rect('D',5,25,5,1).rect('D',15,25,5,1).rect('D',26,25,4,1);
  return p.finish();
}

/** Sky-blue bookish problem: readable face inside an archive screen. */
function research(): PixelDrawing {
  const p = new Painter(36, 30, {
    K:0x30394c,D:0x6596b5,M:0x9cc7df,L:0xd1eafa,
    W:0xfffaf0,Y:0xffd47f,P:0xf1a1a3,T:0x6ecabd,
  });
  p.bands('K',[[2,8,27],[3,6,29],[4,5,30],
    [5,4,31],[6,4,31],[7,3,32],[8,3,32],
    [9,3,32],[10,3,32],[11,3,32],[12,3,32],
    [13,3,32],[14,3,32],[15,3,32],[16,3,32],
    [17,3,32],[18,3,32],[19,3,32],[20,3,32],
    [21,3,32],[22,3,32],[23,3,32],[24,4,31],
    [25,5,30],[26,8,27],[27,8,13],[27,22,27],
    [28,9,13],[28,22,26]]);
  p.bands('D',[[4,8,27],[5,6,29],[6,6,29],
    [7,5,30],[8,5,30],[9,5,30],[10,5,30],
    [11,5,30],[12,5,30],[13,5,30],[14,5,30],
    [15,5,30],[16,5,30],[17,5,30],[18,5,30],
    [19,5,30],[20,5,30],[21,5,30],[22,5,30],
    [23,6,29],[24,7,28]]);
  p.rect('L',7,7,22,10).rect('W',9,9,18,6);
  p.rect('K',11,10,6,5).rect('K',20,10,6,5);
  p.rect('W',12,11,4,3).rect('W',21,11,4,3);
  p.rect('D',14,11,2,3).rect('D',21,11,2,3);
  p.rect('W',14,11,1,1).rect('W',21,11,1,1);
  p.rect('K',16,15,4,1);
  p.rect('Y',6,19,24,2).rect('K',6,22,24,1);
  p.rect('T',9,24,5,1).rect('T',22,24,5,1);
  p.rect('M',9,27,4,1).rect('M',23,27,4,1);
  return p.finish();
}

/** Wispy lilac ghost: a distinct floating outline, wide eyes and light mouth. */
function hallucination(): PixelDrawing {
  const p = new Painter(36, 30, {
    K:0x38354b,D:0x8170ad,M:0xb5a2db,L:0xe0d4f5,
    W:0xfff6f2,P:0xf1b1c7,T:0xf8d581,
  });
  p.bands('K',[[2,13,22],[3,10,25],[4,8,27],[5,7,28],
    [6,6,29],[7,5,30],[8,4,31],[9,4,31],
    [10,3,32],[11,3,32],[12,3,32],[13,3,32],
    [14,3,32],[15,3,32],[16,3,32],[17,3,32],
    [18,4,31],[19,5,30],[20,6,29],[21,7,28],
    [22,8,27],[23,9,26],[24,8,13],[24,22,27],
    [25,7,12],[25,23,28],[26,7,11],[26,24,28]]);
  p.bands('D',[[4,13,22],[5,10,25],[6,9,26],
    [7,8,27],[8,7,28],[9,6,29],[10,5,30],
    [11,5,30],[12,5,30],[13,5,30],[14,5,30],
    [15,5,30],[16,5,30],[17,5,30],[18,6,29],
    [19,7,28],[20,8,27],[21,10,25]]);
  p.bands('M',[[6,12,23],[7,10,25],[8,9,26],
    [9,8,27],[10,7,28],[11,7,28],
    [12,7,28],[13,7,28],[14,7,28],[15,7,28],
    [16,7,28],[17,7,28],[18,8,27],[19,9,26]]);
  p.rect('L',9,10,18,10);
  p.rect('K',10,12,6,5).rect('K',20,12,6,5);
  p.rect('W',11,13,4,3).rect('W',21,13,4,3);
  p.rect('D',13,13,2,3).rect('D',21,13,2,3);
  p.rect('W',13,13,1,1).rect('W',21,13,1,1);
  p.rect('P',8,18,2,1).rect('P',26,18,2,1);
  p.rect('K',16,19,4,2).rect('W',17,20,2,1);
  p.rect('L',8,24,5,1).rect('L',23,24,5,1);
  return p.finish();
}

/** Original three-quarter-view trainer with a clear human silhouette.
 * Red/cream badge cap, swept dark hair, visible eyes, bright blue jacket,
 * pale shirt, shoulder-strap backpack, gloves, jeans and high-top sneakers.
 * Deliberate 32×38 authored pixels at the same 3px grid as other characters.
 * No copied TV-character sprite or procedural sharpening.
 */
function trainer(): PixelDrawing {
  return {
    pixelSize: 3,
    palette: {
      K:0x293246, // restrained dark outline
      H:0x423b40, // swept dark hair
      R:0xc64547, r:0xf26a58, // shaded vermilion cap
      W:0xffeee0, // cream cap panel, undershirt, gloves and sneakers
      S:0xf3bf8d, s:0xd38c65, // face light and warm shadows
      N:0x31547c, B:0x4389bf, b:0x70b7d4, // three-tone blue jacket
      G:0x5f8567, g:0xb6a368, // olive/canvas backpack
      J:0x4a5573, // denim trousers
      T:0x71d3c1, // original teal cap and shirt emblem
      Y:0xf5ca6b, // zipper and belt details
    },
    pixels: [
      '............KKKKKKKKKK..........',
      '..........KKRRRRRRRRRRKK........',
      '.........KRrrrrrrrrrrrrrK.......',
      '........KRrrrrrWWWWWWrrrrK......',
      '.......KRrrrrrrWWTTWWrrrrrK.....',
      '.......KRrrrrrRWWTTWWRRRRRRK....',
      '......KKKKKKKKKKKKKKKKKRRrrrrRK.',
      '.......KKKKKKKKKKKKKKKKKKKKKKKKK',
      '.........KKKKKKKKKKKKKKKKKKKKK..',
      '.........HHHHHHHHHHHHHHHHHK.....',
      '........KHHHHHHHHHHHHHHHHHHK....',
      '........KHHHHHSSHHHHSHHHHHHK....',
      '.........HHHHHSSSKWKSSKWKHHK....',
      '.........HHHHHsSSKKKSSKKKSSK....',
      '...........HHHsSSSSSSSSSSSsK....',
      '............KKSssssssssssKK.....',
      '.............KKssSSSSHHHsK......',
      '...............KKKKKKKKK........',
      '.............KKKKsssssKKK.......',
      '..........KKKKKKKsssssKKKKKK....',
      '.....KKKKKKKNggNNbbNNNNNNNNKKK..',
      '.....KGKKKKKNggbbbbWWWWNBNKKKKK.',
      '.....KGKbBBBNggKbbbWWWWNBNKBbBK.',
      '.....KGKbBBBNggKbbbWTTWNBBKBbBK.',
      '.....KGKbBBBNggKBNbWKWWNBBKBbBK.',
      '.....KNKbBBBNggKBNKWKWWNBBKBbBK.',
      '.....KGKBBBBNggKBNKWKWWNBBKBBBK.',
      '.....KGKBBBBNBBBBNKWKWWNYYKBBBK.',
      '.....KKWWWWWNBBBBNKWKWWNBNWWWWW.',
      '.....KKWWWWWNBNNNNNNNNNNNNWWWWW.',
      '.......NNNNNNNNNNNNNYYNNNNNNNNN.',
      '........ssssKKKKKKKKKKKKKK.sss..',
      '............KNJJJJJK.KNJJJJK....',
      '............KNJbJJJK.KNJbJJK....',
      '............KNJbJJJK.KNJbJJK....',
      '............KJJJJJJK.KJJJJJK....',
      '..........KWrrWWWWWK.KWWrrWWK...',
      '.........KKbbbbbbbKK.KbbbbbbbK..',
    ],
  };
}


/** The Workshop's immense deadline stack, with a crown of new requirements. */
function scopeGiant(): PixelDrawing {
  const p=new Painter(42,36,{
    K:0x30344a,S:0x64758b,M:0x93a9b7,L:0xd5e3d9,
    W:0xfffaf0,R:0xdf8355,Y:0xffcf67,T:0x58c6aa,
  });
  p.rect('K',5,8,32,25).rect('S',7,9,28,21).rect('M',9,11,24,18);
  p.rect('K',10,3,22,6).rect('R',12,4,18,3).rect('Y',17,1,8,3);
  p.rect('K',12,12,18,14).rect('L',13,13,16,11);
  p.rect('W',14,15,14,7);
  p.rect('K',16,16,4,4).rect('K',23,16,4,4);
  p.rect('W',17,16,2,2).rect('W',24,16,2,2);
  p.rect('K',19,22,5,2).rect('T',18,25,7,2);
  p.rect('K',8,27,26,2).rect('W',10,28,22,2).rect('K',12,30,18,1);
  p.rect('K',6,31,9,4).rect('K',27,31,9,4);
  p.rect('R',8,33,6,1).rect('R',28,33,6,1);
  p.rect('Y',2,13,4,4).rect('Y',36,13,4,4);
  p.rect('K',2,17,4,3).rect('K',36,17,4,3);
  return p.finish();
}

/** The Evidence Lab's broken signal ghost with three conflicting antennas. */
function falseSignal(): PixelDrawing {
  const p=new Painter(42,36,{
    K:0x32364d,D:0x63619c,M:0x938ad2,L:0xdad2f8,
    W:0xfffbf2,R:0xf08491,Y:0xffd176,T:0x74cce0,
  });
  p.rect('K',16,1,10,4).rect('Y',19,0,4,4);
  p.rect('K',7,5,28,5).rect('D',9,6,24,3);
  p.rect('K',4,10,34,19).rect('D',6,11,30,17).rect('M',8,13,26,13);
  p.rect('L',10,14,22,12).rect('W',11,16,20,8);
  p.rect('K',12,17,7,5).rect('K',23,17,7,5);
  p.rect('T',13,18,5,3).rect('T',24,18,5,3);
  p.rect('W',13,18,2,1).rect('W',24,18,2,1);
  p.rect('K',18,23,6,2).rect('R',17,25,8,2);
  p.rect('K',6,28,8,2).rect('K',28,28,8,2);
  p.rect('D',7,30,8,2).rect('D',27,30,8,2);
  p.rect('K',4,2,4,5).rect('R',5,1,2,4);
  p.rect('K',34,2,4,5).rect('R',35,1,2,4);
  p.rect('Y',0,15,4,3).rect('Y',38,15,4,3);
  return p.finish();
}

/** Logic Arena's original faceted trial automaton. */
function adaptiveTrial(): PixelDrawing {
  const p=new Painter(42,36,{
    K:0x2e344b,D:0x4d6385,M:0x6f93b0,L:0xcad7de,
    W:0xfaf7e8,R:0xe57d75,Y:0xf3c565,T:0x58ddce,
  });
  p.rect('K',9,3,24,29).rect('D',10,5,22,25);
  p.rect('M',12,7,18,21).rect('L',14,9,14,16);
  p.rect('K',13,10,16,14).rect('W',14,12,14,10);
  p.rect('K',15,14,4,5).rect('K',23,14,4,5);
  p.rect('T',16,15,2,2).rect('T',24,15,2,2);
  p.rect('K',18,20,6,2).rect('Y',20,22,2,2);
  p.rect('K',4,9,5,8).rect('M',5,10,3,6).rect('K',33,9,5,8).rect('M',34,10,3,6);
  p.rect('K',3,22,6,6).rect('R',4,23,4,4).rect('K',33,22,6,6).rect('R',34,23,4,4);
  p.rect('K',11,31,8,5).rect('K',23,31,8,5);
  p.rect('Y',13,33,4,1).rect('Y',25,33,4,1);
  p.rect('Y',17,0,8,3).rect('K',19,3,4,4);
  return p.finish();
}

/** Original three-screen evidence hydra: each head echoes one source signal. */
function hallucinationHydra(): PixelDrawing {
  const p=new Painter(42,36,{
    K:0x303a51,D:0x526e88,M:0x7397a3,L:0xb1d5c4,
    W:0xfff7dc,T:0x64e1c1,Y:0xf8d37c,R:0xde7d9b,
  });
  // Three independent-looking screens share the same original signal trunk.
  p.rect('K',4,10,12,12).rect('D',6,12,8,8).rect('M',7,13,6,6);
  p.rect('K',15,2,12,15).rect('D',17,4,8,11).rect('M',18,5,6,8);
  p.rect('K',26,10,12,12).rect('D',28,12,8,8).rect('M',29,13,6,6);
  p.rect('W',8,15,3,2).rect('W',19,8,4,2).rect('W',30,15,3,2);
  p.rect('K',9,15,1,2).rect('K',20,8,2,2).rect('K',31,15,1,2);
  p.rect('R',8,19,4,1).rect('R',19,13,4,1).rect('R',30,19,4,1);
  // Duplicated evidence links are visibly wired into one shared body.
  p.rect('K',8,22,5,3).rect('K',19,16,4,9).rect('K',30,22,5,3);
  p.rect('T',10,22,2,3).rect('T',20,17,2,8).rect('T',32,22,2,3);
  p.rect('K',10,25,24,9).rect('D',12,26,20,6).rect('M',14,27,16,4);
  p.rect('W',16,27,12,3).rect('K',17,28,10,1);
  p.rect('Y',19,29,6,1).rect('T',17,30,2,1).rect('T',25,30,2,1);
  p.rect('K',6,28,5,6).rect('K',33,28,5,6);
  p.rect('R',7,31,3,2).rect('R',34,31,3,2);
  p.rect('Y',2,19,3,3).rect('Y',37,19,3,3);
  return p.finish();
}

export const handDrawnModels = { astra:astra(), grok:grok(), fable:fable() };
export const handDrawnEnemies: Record<string, PixelDrawing> = {
  'TASK':task(),
  'BUG':bug(),
  'RESEARCH REQUEST':research(),
  'MATH PROBLEM':math(),
  'HALLUCINATION':hallucination(),
  'HALLUCINATION HYDRA':hallucinationHydra(),
  'RUSH RIVAL':bug(),
  'CITATION SPECTER':hallucination(),
  'CLOCKWORK RIVAL':math(),
  'SCOPE GIANT':scopeGiant(),
  'FALSE SIGNAL':falseSignal(),
  'ADAPTIVE TRIAL':adaptiveTrial(),
};
export const handDrawnTrainer = trainer();
