import { modelSprites, type ModelId } from './pixelArt';

/** Identical source pixels in the party menu, Field Guide, and Phaser battle sprites. */
export function PixelPortrait({ model, className = '' }: { model: ModelId; className?: string }) {
  const art = modelSprites[model];
  const width = Math.max(...art.pixels.map(row => row.length));
  const height = art.pixels.length;
  return (
    <svg className={'pixel-portrait ' + className} viewBox={'0 0 ' + width + ' ' + height}
      preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges"
      focusable="false" aria-hidden="true">
      {art.pixels.flatMap((row, y) =>
        Array.from(row).flatMap((pixel, x) => {
          const color = art.palette[pixel];
          return color === undefined ? [] : [
            <rect key={y + ':' + x} x={x} y={y} width="1" height="1"
              fill={'#' + color.toString(16).padStart(6, '0')} />,
          ];
        }),
      )}
    </svg>
  );
}
