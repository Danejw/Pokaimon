# Pokaimon Coding Agent Guide

This is the repository-wide entry point for AI coding agents. Keep it short and load detailed instructions only when a task needs them.

## Mission and source of truth

**Pokaimon:** A mobile-first, turn-based browser game where playable AI models battle real-world tasks. Gameplay teaches practical AI capabilities and model selection.

Before making changes, read the relevant sections of:
- [Game Design](docs/GAME_DESIGN.md) for what to build, rules, terminology, educational goals, scope and non-goals.
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) for the completed historical MVP phases and baseline.
- [Battle Evolution roadmap](docs/battle-evolution/README.md) and [tracker](docs/battle-evolution/TASKS.md) for the **next** five post-MVP phases; read only the relevant detailed phase file, work serially, and do not mark planning as implementation.
- [Retro Battle Direction](docs/RETRO_BATTLE_DIRECTION.md) for the **currently approved** player-driven random encounter, trainer/summon, pixel-art animation and battle presentation. This supersedes older screen-menu assumptions.
- Existing source code and tests. **Actual repository behavior is the source of truth for what exists.** If documentation disagrees with code, report and resolve the discrepancy before changing behavior.

## Implementation rules

- Build **one small, complete, testable vertical slice** per task. Avoid future-phase scaffolding or unnecessary dependencies.
- Initial stack: TypeScript, Vite, React, Phaser 4. Prefer a pure deterministic, independently tested battle reducer. Phaser renders animations; React provides menus and accessible controls.
- Data-drive model definitions, shared capability moves, enemies and battle events. Validate IDs and references, and use deterministic seeds for reproducible battles.
- Keep the game usable on portrait phones and desktop. Check touch, keyboard, reduced motion, mute, feedback, and reading order.
- Every move should teach a real technique; label fictional balance/stat values and battle outcomes **Simulated**. Never imply that an AI model executed an external task without real evidence.
- Keep sprites, characters, interface styling and music original. Brand/model names need accurate attribution without implied endorsement.
- Use **AG-UI** at the eventual frontend-to-agent integration boundary. Use provider-specific adapters behind the server; keep the rules engine independent of both. The current official spec at https://docs.ag-ui.com/ overrides older bundled examples.
- Never expose credentials in the client, call paid models without explicit authorization, or mark task completion without independent verification. Persistent computers and multi-agent orchestration are outside MVP.

## Workflow and verification

1. Inspect current code and the relevant phase checklist. State assumptions when a behavior is not implemented yet.
2. Write or update failing tests for the intended behavior first, including invalid and failure cases.
3. Make the smallest change to pass the tests. Keep game mechanics out of UI and animation callbacks.
4. Run the checks supported by the repo: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build` **once scripts exist**. Never report unexecuted checks as passing.
5. For interactive changes, exercise the complete flow and inspect screenshots at Android portrait dimensions (at least 360 × 800 and 390 × 844) and desktop. Use Playwright and structured manual checks where available.
6. Report changed paths/commit, what is playable, actual test evidence, remaining unknowns, and phase Go/No-go. Update documentation and checkboxes only when verified.

The initial implementation of Phases 0–4 now exists. Read [MVP Status](docs/MVP_STATUS.md) before any further work. Verify the actual deployed site and CI instead of assuming the release is live.

## Official skill routing

Skills are under [`.agents/skills/`](.agents/skills/) with provenance in [`.agents/SOURCES.md`](.agents/SOURCES.md). Read the specific skill's `SKILL.md` and only needed references; do not load every skill into context.

| Task | Use |
| --- | --- |
| Phaser scenes, render lifecycle, battle effects | `phaser-2d-game` |
| Phaser scaling, orientation and portrait layouts | `scale-and-responsive` |
| Sprite sheets, anchor/scale normalization | `sprite-pipeline` |
| Game HUD, dialogues, menu/controls | `game-ui-frontend` |
| React code, rendering and client performance | `vercel-react-best-practices` |
| Browser automation and E2E testing | `playwright-cli` |
| End-to-end gameplay feel and visual QA | `game-playtest` |
| AG-UI event and streaming integration | `copilotkit-agui` + current https://docs.ag-ui.com/ |
| Secure coding / requested security review | `security-best-practices` |
| Explicit repository threat modeling | `security-threat-model` |
| Cross-cutting browser-game architecture, only if needed | `web-game-foundations` |

The sprite tools referenced by OpenAI's original skill are vendored under `.agents/scripts/`; its relative `../../scripts/` paths resolve from the installed skill folder. The AG-UI skill is archived upstream: current protocol docs take priority.

## Change discipline

- Favor modular, composable, reusable, interoperable, portable, verifiable and simple solutions.
- Keep commit scope focused and preserve existing behavior unless a requested change needs otherwise.
- Ask for authorization before spending credits, deploying, changing secrets, or affecting external accounts.
- When unclear, choose the smallest reversible approach supported by the game design. Record substantive design decisions in `docs/`, not in an expanding root instruction file.
