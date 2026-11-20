# Vendored official development skills

Pokaimon keeps task-specific coding-agent skills under [skills/](skills/). [Root AGENTS.md](../AGENTS.md) routes work to the smallest relevant skill.

**Ten requested skills:** `phaser-2d-game`, `scale-and-responsive`, `sprite-pipeline`, `game-ui-frontend`, `playwright-cli`, `game-playtest`, `security-best-practices`, `vercel-react-best-practices`, `copilotkit-agui`, and `security-threat-model`.

**One shared dependency:** `web-game-foundations`, referenced by the Phaser/game UI/playtest skills. Supporting references and scripts live in `references/` and `scripts/` so original relative links from OpenAI's game-studio skills resolve.

## Source pinning

All vendored skill text and companion files are copied from these official upstream snapshots. See [SOURCES.md](SOURCES.md) for exact source paths, pin SHAs, licenses and notes.

| Publisher | Repository | Commit |
| --- | --- | --- |
| openai/plugins | https://github.com/openai/plugins | `981b02c0c44058b595f3b4180002c3ae3c806d40` |
| phaserjs/phaser | https://github.com/phaserjs/phaser | `02d8931b626d9764c133cbb3fbf99966c03c757c` |
| microsoft/playwright-cli | https://github.com/microsoft/playwright-cli | `c872a33cec77fa03c28fa7c6d1ad99d15d04ce42` |
| openai/skills | https://github.com/openai/skills | `49f948faa9258a0c61caceaf225e179651397431` |
| vercel-labs/agent-skills | https://github.com/vercel-labs/agent-skills | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` |
| CopilotKit/skills | https://github.com/CopilotKit/skills | `8d78cf908844a30d2909f7da4eb8cb6f51fa02ad` |

`copilotkit-agui` is from an **archived** repository and may describe older protocol shapes. Check https://docs.ag-ui.com/ before implementing AG-UI. The `playwright-cli` skill requires the CLI to be installed separately when browser testing starts. The sprite helper scripts may require Pillow; they are included without executing them.

Skill installation adds **guidance only**, not runtime dependencies, API credentials, live AI calls, or game features. Skills and licenses are maintained as upstream snapshots; update intentionally and review changes.
