# Pokaimon: handheld pixel-art UI system

**Status:** Hand-drawn readability refinement on `feat/authentic-pixel-handheld-ui`. Based on mobile screenshot review: extra density made the creatures look fuzzy, so detail is now authored deliberately.

## Objective

Give Pokaimon the immediate visual read of a nostalgic early-2000s pixel-art handheld battle RPG. Preserve the existing game loop: random wild problem, trainer entrance, AI selection, summon, capability moves, victory/defeat and lessons.

Design reference qualities: warm horizontal-gradient-like **pixel color bands**, small painted sprites on grassy platforms, strong opponent/companion status frames, bottom dialogue window, party-style selection, two-column commands, clearly telegraphed directional cursor, stepped action animation, and original synth cues.

All assets remain original. No copied franchise sprites, trainer likenesses, UI bitmaps, logos, sound samples or music.

## One visual language

- **Canvas:** Native 360 × 330 handheld stage, Phaser scales to its parent with crisp pixel rendering. Deliberately use authored 3-pixel squares for sprites, not an enlarged high-DPI canvas.
- **Chrome:** navy (\`#303545\`) 4–5px outer borders; inset parchment border; 3–5px offset shadows. Square corners only.
- **Surfaces:** parchment (\`#fffbee\`), pale sand, sea-glass green, sun yellow and deep ink.
- **Typography:** Chakra Petch for readable UI, battle text and metadata; Press Start 2P only for arcade-style headlines and short labels. Always maintain readable tap targets.
- **Layout:** gameplay arena first, with enemy HUD at upper left, summoned AI status lower right, full-width connected dialogue box, and a battle-specific control panel. Mobile and desktop share the same authored layout.
- **Portraits:** React model selection, Field Guide and Phaser battle share one `modelSprites` pixel matrix per character, imported from `src/game/handDrawnSprites.ts` by `pixelArt.ts`. `spriteRaster.ts` caches the same original low-resolution pixel bitmap for Phaser and the accessible React portraits.
- **Character art:** `src/game/handDrawnSprites.ts` defines nine completely original character sprites with explicit silhouette bands, limited palettes, intentional highlights and large eyes. Grok (dual-antenna robot with teal visor) and Math Problem (purple triangular math wizard with a gold + crest) are the reference pair; the rest follow the same readable proportions. Art uses 30–36 columns × 27–31 rows at 3 screen pixels per authored cell, rather than automatically subdividing, shading or dithering preexisting shapes. Battle characters are roughly 20–35% larger than the early 20×18 sprite versions where stage room allows.
- **Environment:** keep the previously approved layered ridges, foliage and grassy platforms unchanged. Improve character clarity, not background density.
- **Motion:** sprite movement, hit flashes and HP updates occur in deliberate step-like beats, with optional reduced motion. UI controls still respond to keyboard, mouse and touch.
- **Simulation truth:** battle results, stats and effects are fictional. Every model capability lesson remains factual or qualified, with links to vendor docs in the Field Guide.

## Artwork QA

Vitest checks all nine authored matrices, pixel dimensions, simple palette, large facial features and a shared source for battle and portraits. Playwright checks the 360×330 pixelated canvas, mobile viewport fit and battle interactions. Compare the updated screenshots to the user's rejected fuzzy, highly detailed sprites: character silhouettes, eyebrows/eyes, faceplate boundaries and markings should be readable without texture noise.

## Responsive acceptance

Check 360 × 800, 390 × 844 and desktop. The battle HUD must remain over the arena, model names must not clip the layout, menus must be entirely tappable, there must be no horizontal overflow and focus must remain visible. Reduced-motion mode must preserve all state transitions and feedback.

## QA / comparison

The branch adds Playwright screenshots of the intro/model selection, move UI, Field Guide and settings under \`test-results/visual/\`. GitHub CI uploads them as a review artifact. These screenshots are evidence of the rendered app, and should be compared to the user's pixel-art reference for next-step design adjustments.

This refinement only changes sprite definitions and returns rendering to its pixel-perfect native resolution. Battle mechanics, progression, music, sound effects and Chakra Petch typography are unchanged. Battle reducer behavior, campaign progress, AG-UI and provider adapters remain unchanged.
