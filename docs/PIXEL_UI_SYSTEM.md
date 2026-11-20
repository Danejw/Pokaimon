# Pokaimon: handheld pixel-art UI system

**Status:** Visual overhaul prototype on \`feat/authentic-pixel-handheld-ui\`. Source: user-provided reference images and [retro battle interaction design](RETRO_BATTLE_DIRECTION.md).

## Objective

Give Pokaimon the immediate visual read of a nostalgic early-2000s pixel-art handheld battle RPG. Preserve the existing game loop: random wild problem, trainer entrance, AI selection, summon, capability moves, victory/defeat and lessons.

Design reference qualities: warm horizontal-gradient-like **pixel color bands**, small painted sprites on grassy platforms, strong opponent/companion status frames, bottom dialogue window, party-style selection, two-column commands, clearly telegraphed directional cursor, stepped action animation, and original synth cues.

All assets remain original. No copied franchise sprites, trainer likenesses, UI bitmaps, logos, sound samples or music.

## One visual language

- **Canvas:** 360 × 330 virtual stage; Phaser 4 scales to its parent and renders low-resolution pixel sprites with no smoothing.
- **Chrome:** navy (\`#303545\`) 4–5px outer borders; inset parchment border; 3–5px offset shadows. Square corners only.
- **Surfaces:** parchment (\`#fffbee\`), pale sand, sea-glass green, sun yellow and deep ink.
- **Typography:** Chakra Petch for readable UI, battle text and metadata; Press Start 2P only for arcade-style headlines and short labels. Always maintain readable tap targets.
- **Layout:** gameplay arena first, with enemy HUD at upper left, summoned AI status lower right, full-width connected dialogue box, and a battle-specific control panel. Mobile and desktop share the same authored layout.
- **Portraits:** both the React model selection and Phaser battle consume the same \`modelSprites\` pixel matrix definitions in \`src/game/pixelArt.ts\`. These are SVG rectangles for the accessible menu and Phaser Graphics squares in combat. Never duplicate model artwork by embedding screenshots.
- **Higher-detail sprites:** \`src/game/spriteDetail.ts\` refines every original creature, enemy and trainer with actual subpixels, directional highlights, shadows and subject-specific facial and material marks. Original 4px artwork becomes a 2px lattice (2x dimensions, 4x addressable pixel count); original 3px artwork becomes a 1px lattice (3x dimensions, 9x addressable pixel count). Overall displayed character sizes and silhouettes remain consistent. Changes to the art are shared by battle, party portraits and Field Guide, with no external image assets.
- **Environment:** smaller terrain steps, layered ridges, foreground tufts, stone flecks and individual grass blades enhance the 360x330 battle scene without increasing the canvas resolution or changing game interactions.
- **Motion:** sprite movement, hit flashes and HP updates occur in deliberate step-like beats, with optional reduced motion. UI controls still respond to keyboard, mouse and touch.
- **Simulation truth:** battle results, stats and effects are fictional. Every model capability lesson remains factual or qualified, with links to vendor docs in the Field Guide.

## Artwork QA

Automated pixel-art tests check refined dimensions, palette coverage, unchanged source geometry, multiple detail colors and character differentiation. Confirm manually that facial features remain legible in the battle and small portraits, including on physical Android at native scale. Avoid blurred upscaling, uncontrolled dithering, excessive particle noise and loss of creature identity.

## Responsive acceptance

Check 360 × 800, 390 × 844 and desktop. The battle HUD must remain over the arena, model names must not clip the layout, menus must be entirely tappable, there must be no horizontal overflow and focus must remain visible. Reduced-motion mode must preserve all state transitions and feedback.

## QA / comparison

The branch adds Playwright screenshots of the intro/model selection, move UI, Field Guide and settings under \`test-results/visual/\`. GitHub CI uploads them as a review artifact. These screenshots are evidence of the rendered app, and should be compared to the user's pixel-art reference for next-step design adjustments.

This system intentionally changes visual components and styles only. Battle reducer behavior, campaign progress, AG-UI and provider adapters remain unchanged.
