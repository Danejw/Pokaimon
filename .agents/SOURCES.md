# Skill provenance and maintenance

Bundled text is sourced from official publisher repositories and preserved without edits to each original `SKILL.md`. The repository's root `AGENTS.md` provides Pokaimon-specific adaptation.

- [`.agents/skills/phaser-2d-game/SKILL.md`](../../.agents/skills/phaser-2d-game/SKILL.md): https://github.com/openai/plugins/blob/981b02c0c44058b595f3b4180002c3ae3c806d40/plugins/game-studio/skills/phaser-2d-game/SKILL.md
- [`.agents/skills/scale-and-responsive/SKILL.md`](../../.agents/skills/scale-and-responsive/SKILL.md): https://github.com/phaserjs/phaser/blob/02d8931b626d9764c133cbb3fbf99966c03c757c/skills/scale-and-responsive/SKILL.md
- [`.agents/skills/sprite-pipeline/SKILL.md`](../../.agents/skills/sprite-pipeline/SKILL.md): https://github.com/openai/plugins/blob/981b02c0c44058b595f3b4180002c3ae3c806d40/plugins/game-studio/skills/sprite-pipeline/SKILL.md
- [`.agents/skills/game-ui-frontend/SKILL.md`](../../.agents/skills/game-ui-frontend/SKILL.md): https://github.com/openai/plugins/blob/981b02c0c44058b595f3b4180002c3ae3c806d40/plugins/game-studio/skills/game-ui-frontend/SKILL.md
- [`.agents/skills/playwright-cli/SKILL.md`](../../.agents/skills/playwright-cli/SKILL.md): https://github.com/microsoft/playwright-cli/blob/c872a33cec77fa03c28fa7c6d1ad99d15d04ce42/skills/playwright-cli/SKILL.md
- [`.agents/skills/game-playtest/SKILL.md`](../../.agents/skills/game-playtest/SKILL.md): https://github.com/openai/plugins/blob/981b02c0c44058b595f3b4180002c3ae3c806d40/plugins/game-studio/skills/game-playtest/SKILL.md
- [`.agents/skills/security-best-practices/SKILL.md`](../../.agents/skills/security-best-practices/SKILL.md): https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-best-practices/SKILL.md
- [`.agents/skills/vercel-react-best-practices/SKILL.md`](../../.agents/skills/vercel-react-best-practices/SKILL.md): https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices/SKILL.md
- [`.agents/skills/copilotkit-agui/SKILL.md`](../../.agents/skills/copilotkit-agui/SKILL.md): https://github.com/CopilotKit/skills/blob/8d78cf908844a30d2909f7da4eb8cb6f51fa02ad/skills/copilotkit-agui/SKILL.md
- [`.agents/skills/security-threat-model/SKILL.md`](../../.agents/skills/security-threat-model/SKILL.md): https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model/SKILL.md
- [`.agents/skills/web-game-foundations/SKILL.md`](../../.agents/skills/web-game-foundations/SKILL.md): https://github.com/openai/plugins/blob/981b02c0c44058b595f3b4180002c3ae3c806d40/plugins/game-studio/skills/web-game-foundations/SKILL.md

### Licensing and provenance
- Phaser: MIT, see `.agents/skills/scale-and-responsive/LICENSE.md`.
- Microsoft Playwright CLI: Apache-2.0, see `.agents/skills/playwright-cli/LICENSE`.
- CopilotKit: MIT, see `.agents/skills/copilotkit-agui/LICENSE`.
- OpenAI security skills: upstream per-skill `LICENSE.txt` files bundled.
- Vercel React skill declares MIT in its metadata.
- OpenAI game-studio material: upstream at https://github.com/openai/plugins; no repository-level LICENSE file was found during installation. Keep upstream attribution and review redistribution requirements before further publication/reuse.

The AG-UI CopilotKit repository is archived; validate event shapes and SDK usage against https://docs.ag-ui.com.

### Refresh procedure
Confirm each source's current location/license; diff against the pinned SHA; update only changed files and dependencies; review and test routes. Do not automatically pull upstream changes.
