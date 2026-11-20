# Pokaimon: Agent Instructions

Read [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the product contract and [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the current phase and its acceptance tests. The repo's current code and tests are the source of truth for implemented behavior.

## Project rules
- Follow **one testable vertical slice at a time**; do not expand into future phases without a request.
- Build a mobile-first, original pixel-art AI-literacy game with React + TypeScript + Phaser 4. Keep the battle reducer deterministic and separate from rendering.
- AI model identities and capabilities are versioned and sourced. Fictional gameplay stats and outcomes are clearly labeled **simulated**. Never claim real model/tool execution when it has not occurred.
- Use **AG-UI** for connected agent-to-frontend communication, with provider adapters behind it. Official current AG-UI specs at https://docs.ag-ui.com/ are authoritative; bundled CopilotKit guidance is a historical supplement.
- Keep provider secrets and paid model execution server-side, explicitly authorized and verified.
- Use original art, sprites, audio and distinct UI; do not copy copyrighted Pokémon assets or music.
- Write tests before implementing each phase, run relevant checks, manually verify on Android-sized portrait layouts and desktop, and report pass/fail evidence.

## Choose the skill that matches the work
Skills are vendored at `.agents/skills/<skill-name>/SKILL.md`. Read **only the relevant skill and its local references**.

| Work | Primary skill | Secondary when needed |
| --- | --- | --- |
| Phaser 2D scene and battle animation | `phaser-2d-game` | `web-game-foundations` |
| Phaser canvas sizing, portrait and browser resizing | `scale-and-responsive` | `game-ui-frontend` |
| Pixel creature animation strips | `sprite-pipeline` | `phaser-2d-game` |
| Combat HUD, model selection, menus | `game-ui-frontend` | `vercel-react-best-practices` |
| React implementation or performance | `vercel-react-best-practices` | `game-ui-frontend` |
| Automated browser interaction, screenshots, regression checks | `playwright-cli` | `game-playtest` |
| Structured gameplay feel and visual QA | `game-playtest` | `playwright-cli` |
| Streaming protocol, events, AG-UI integration | `copilotkit-agui` | current official AG-UI docs |
| Secure defaults / security review | `security-best-practices` | `security-threat-model` on explicit threat-model task |
| Formal repository-grounded threat model | `security-threat-model` | `security-best-practices` |

The shared 2D art scripts from the game studio skill are in `.agents/scripts/` (not at the repository root). The skill's relative `../../scripts/` references resolve correctly from its installed directory.

Skills are reference material, not a blanket instruction to add packages, spend credits, or implement out-of-scope systems. For skills that cover both React and Next.js, apply only the React/Vite-relevant parts. For Phaser skills, follow the project's chosen Phaser 4 API and verify changing version-specific advice.

## Delivery
For each implementation slice, report changed files/commit, exactly what is playable, actual automated and manual tests, any unverified assumptions, and Go/No-go against the relevant phase checklist. Do not mark a phase done if tests or gameplay verification are missing.
