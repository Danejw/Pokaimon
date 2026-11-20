# Pokaimon: Retro battle interaction and visual direction

**Approved interaction direction** (user feedback 2026-11-19 HST). Companion to [GAME_DESIGN.md](GAME_DESIGN.md). This supersedes the initial “choose an encounter, then a model” web-app menu concept.

## Experience

**PLAY -> random wild encounter -> trainer appears -> model selection inside battle -> trainer throws an original signal capsule -> selected AI creature is summoned -> player chooses capability moves -> battle resolution -> victory/defeat -> retry or next wild encounter.**

The game selects a wild problem automatically from the current encounter pool. There is **no visible encounter-selection list**. A query parameter such as \`?encounter=task\` can force an encounter solely for reproducible tests or shareable links.

The inspiration is a classic late-1990s/early-2000s handheld, turn-based RPG. Original artwork and music are required. Avoid copying recognizable franchise trainer designs, proprietary creature silhouettes, sprites, ball emblems, UI art or licensed music.

### Player-paced animated sequence

| State | Scene | Input |
| --- | --- | --- |
| encounter | Warm-yellow grassy arena; problem slides in from right, original red-capped, green-pack trainer slides in from left; status panel fills | short transition |
| selection | Dialogue: “A wild TASK appeared!”; three stacked retro row choices, directional cursor, handheld menu beep | arrows/WASD/tap + confirm |
| throw | Trainer raises arm and throws an original pixel-art signal capsule in a stepped arc; trainer slides/fades away | short transition |
| summon | Bright pixel flash and ring; chosen model companion materializes, does a characteristic entrance; companion status panel appears | short transition |
| command | Four distinct moves, AP/status info; stage requirements, move descriptions and keyboard navigation | choose a move |
| attack | Each model has an original attack style; projectiles move in discrete pixel steps; enemy blinks/shakes, stage progress animates in chunks | input locked until hit resolves |
| result | Final HP drops, problem collapses, model does victory pose; learn why it worked or failed; retry or start next wild encounter | choose retry/next |

Unlike a 15-second video, the game **waits indefinitely for human input** at selection and command states. The transitions remain short and deliberate. Reduced-motion bypasses most flourishes but preserves feedback, action order, and gameplay.

### Model-specific character motion

| Model | Original identity | Summon | Attack |
| --- | --- | --- | --- |
| GPT-6.2 Astra | Mint/blue thinking creature with a glowing forehead glyph | star-shaped square-particle spiral and gentle bounce | cyan reasoning rings and square nodes |
| Grok 4.7 | Violet angular robot with dual antennae and visor | stepped electrical glitch/warp entrance | violet electric bolt pixels |
| Claude Fable 5.2 | Amber/orange bibliophile creature with large earlets | warm orange ink-like squares and a hop | amber glyph/paper shards |

These are **original game characters**, not asserted official corporate mascots. The earlier video prompt used Muse/Jolly and Dots; those serve as animation storytelling references, while the current MVP model roster remains as documented until explicitly changed.

### Visual system

A fixed side-view camera; nearest player sprite bottom left and wild enemy upper right; pale cream framed dialogues; crisp 2x/3x pixels, limited warm palette, dark pixel borders, high-contrast progress bars, grid-snapped cursor, 8-bit-style original sound cues. Remove modern SaaS cards, rounded gradients, floating badges, giant web hero typography, and busy screen chrome. Use the attached user reference images for general nostalgic rhythm but create original game art.

**Model selection is presented after the encounter, over the same battle field.** The trainer exits as the model is summoned. The opponent stays on screen for the entire battle.

### Quality gates

- Every state transition has a clear entry/exit condition and does not create duplicate actions.
- Each model has distinct entrance, idle, attack, hurt or reaction, and victory poses/effects.
- React presents controls; Phaser handles all staged visuals. The pure battle reducer remains the only rules authority.
- Attacking never calls an AI API in this MVP. The result is labeled a simulation.
- All five enemy designs and all three model characters remain original and consistent across frames.
- Tests verify random selection, fixed-seed test encounters, selection gating, skip/reduced-motion behavior, stage progress and result/retry.
- Must remain usable on Android portrait, desktop mouse and keyboard. All effects run at game pace, no prerecorded 15-second movie.
