# Pokaimon pixel-art design preview

The design review build is published from the unmerged
`feat/authentic-pixel-handheld-ui` branch to:

**https://danejw.github.io/Pokaimon/preview/**

The original production game stays at https://danejw.github.io/Pokaimon/.
The Pages workflow checks out each version independently and builds
with the correct asset base path.

## Playtest focus

1. On a phone, tap PLAY and keep sound enabled in Settings.
2. Check pixel-art portraits, the enemy and companion HUD, moves, dialogue,
   menu navigation, and victory/defeat screens.
3. Listen for original pulse-wave sound effects and chiptune battle music.
   No franchise recordings or melodies are used.
4. Compare the feel and legibility with early handheld monster-battling RPGs,
   while keeping every creature and sound original.

The draft PR must be reviewed before merging. The preview alone does not
publish redesign source files into `main`.

New edits to the preview branch require another Pages workflow run from
`main` before the preview URL updates. CI on the PR checks the branch.
