# Official Skills Integrity Audit

**Audited:** 2026-11-19  
**Repository:** [Pokaimon](https://github.com/Danejw/Pokaimon)  
**Result:** All 10 requested skills plus the shared OpenAI `web-game-foundations` dependency and relevant shared resources were verified byte-for-byte against pinned official Git commits.

## Verification

- **144 official source files matched** by Git blob SHA, including primary `SKILL.md` documents, agent metadata, rules, reference guides, scripts and license files.
- **Missing:** 0
- **Content mismatches:** 0
- **Unexpected files inside vendored skill/resource folders:** 0
- **Full Vercel React best-practices skill:** includes the ~108 KB compiled `AGENTS.md`, `SKILL.md`, `README.md`, `metadata.json` and the complete `rules/` directory.
- **Phaser scale-and-responsive:** the official skill directory itself contains only `SKILL.md`. The repository-level Phaser license is bundled separately.
- **OpenAI game-studio:** five specialist/shared skill directories, all their `agents/openai.yaml` metadata, all 16 shared references and three executable sprite preparation scripts.
- **OpenAI security:** both complete skill directories, all published references (including those for non-Pokaimon frameworks) and metadata.
- **Playwright CLI:** all original references; the `@playwright/cli` executable must still be installed before using browser automation.
- **AG-UI (CopilotKit):** all original source files. Its upstream repository is archived; current [AG-UI documentation](https://docs.ag-ui.com/) is authoritative.

## Repeatable local verification

```bash
node scripts/verify-vendored-skills.mjs
```

This uses Node's built-in modules to compute Git blob hashes and compares every file with [the machine-readable inventory](../.agents/skills-manifest.json). It does not need a network connection, an npm install, or provider credentials.

## Scope notes

A vendored agent skill is instruction content and bundled helper files; it is not a preinstalled runtime. Browser automation binaries and Python image libraries remain separate dependencies when their workflows are first executed. The game itself is still at the documentation phase.

Upstream citations, licenses and pinned commits are recorded in [SOURCES.md](../.agents/SOURCES.md). Update vendored files only after reviewing upstream changes and regenerating the manifest, then run the verifier. Modifications to original upstream content will correctly cause a mismatch.
