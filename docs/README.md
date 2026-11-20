# Pokaimon Docs

Pokaimon is a turn-based AI battle game that teaches practical model selection and AI techniques through real-world problem encounters.

## Start here

1. **[Game Design Document](./GAME_DESIGN.md)**: Product vision, gameplay rules, starting roster, move library, task enemies, learning objectives, UI/UX, model-agnostic architecture, AG-UI, trust/rights, and MVP definition.
2. **[Implementation Plan](./IMPLEMENTATION_PLAN.md)**: Phase-by-phase vertical slices, estimated timeline, test-first acceptance criteria, go/no-go gates, and post-MVP expansions.

## Current status

**Documentation complete; game implementation not yet started.** The repository was empty before these documents were added on 2026-11-19.

**MVP target:** 3 AI model characters, 4 moves each, 5 playable problem encounters, an understandable educational battle loop, mobile-friendly controls, and an AG-UI standards boundary.

**First milestone:** Phase 0, a working responsive web app shell, then Phase 1, one fully playable TASK encounter.

## Ground rules

- All simulated battles must be labeled as simulations. Never imply an actual model performed work without real execution and independent verification.
- Keep game logic deterministic and separate from visuals, AI APIs, and AG-UI transport.
- Prefer original game sprites, visuals, and music; model references require correct attribution.
- Make every phase demonstrably playable and testable before adding new features.
- Keep content and provider support versioned so new models and moves can be added without rewriting the engine.

**Use the Game Design Document for what to build and the Implementation Plan for when/how to build and prove it.**
