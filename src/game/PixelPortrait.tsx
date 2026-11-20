import { useMemo } from 'react';
import { modelSprites, type ModelId } from './pixelArt';
import { spriteImageUrl } from './spriteRaster';

/**
 * Pixel-perfect PNG data URLs are generated from the exact same authored
 * art matrices used by Phaser. One cached image replaces tens of thousands
 * of individual SVG <rect> DOM nodes in party and Field Guide portraits.
 */
export function PixelPortrait({ model, className = '' }: { model: ModelId; className?: string }) {
  const art = modelSprites[model];
  const url = useMemo(() => spriteImageUrl(art), [art]);
  return <img className={'pixel-portrait ' + className} src={url}
    alt="" aria-hidden="true" draggable={false} decoding="sync" />;
}
