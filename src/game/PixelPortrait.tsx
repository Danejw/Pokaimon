import { useMemo } from 'react';
import { modelSprites, type ModelId } from './pixelArt';
import { spriteImageUrl } from './spriteRaster';

/**
 * Crisp low-resolution portraits come from the same deliberately drawn
 * pixel matrices used by Phaser, without a separate portrait asset.
 */
export function PixelPortrait({ model, className = '' }: { model: ModelId; className?: string }) {
  const art = modelSprites[model];
  const url = useMemo(() => spriteImageUrl(art), [art]);
  return <img className={'pixel-portrait ' + className} src={url}
    alt="" aria-hidden="true" draggable={false} decoding="sync" />;
}
