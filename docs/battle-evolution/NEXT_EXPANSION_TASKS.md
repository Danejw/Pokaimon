# Pokaimon next expansion: Phase 6 then Phase 8

**Status:** Phase 6 three signature encounters and Phase 8 discovery/evolution pipeline are implemented on this branch. Final green CI, physical phone QA, live official source checks, and opt-in production publication remain outstanding. **Source of truth:** [Phase 6](PHASE_6_BATTLE_INTELLIGENCE.md) and [Phase 8](PHASE_8_AUTONOMOUS_MODEL_EVOLUTION.md). This tracker is for the new post-Battle-Evolution work; [TASKS.md](TASKS.md) records the previous Phase 1–5 implementation. Phase 7 Gauntlet is intentionally deferred; Phase 8 follows Phase 6 directly.

**Branch:** `feat/battle-evolution`; keep production `main` untouched. Current Phase 1–5 preview is `/Pokaimon/next/`. The new documents are plans, not evidence that code exists.

## Phase 6: Battle Intelligence 2.0

- [x] **6A: Discoverable tactical clues** — a Hallucination Hydra clue and two genuine choices with different reducer consequences
- [x] **6B: Reactive enemy intent** — telegraphed policy, at least one actual counterplay, typed events, UI feedback
- [x] **6C: Multiple routes and recovery** — two different wins, a recoverable mistake and a losing path; deterministic solver matrix and replay
- [x] **6D: Regression Golem** — authored hypotheses, risky patch, regression, tested-fix win and alternate win
- [x] **6E: Scope Shifter** — changing requirements, early clarification vs adaptive replanning, resource tradeoffs
- [x] **6F: Presentation and game integration** — original art/FX/audio, evidence notebook, strategy recap, challenge and progress compatibility
- [ ] **6G: Balance and phase gate** — three memorable bosses, two verified wins each, seed/roster matrix, manual full playthroughs, mobile/desktop/keyboard/reduced-motion, CI
- [ ] **Gate 6:** play all three complete battles with meaningful strategy and no legacy regressions

Do not start Phase 8 until Gate 6 has passing automated checks and actual screenshot/representative play evidence.

## Phase 8: Autonomous Living Model Evolution

- [x] **8A: Versioned model lineage** — immutable official IDs, evolution/branch relationships, save and replay compatibility
- [x] **8B: First trusted provider adapter** — fixtures, official model listing + evidence check, idempotent candidate detection
- [x] **8C: OpenAI, Anthropic, xAI** — independent adapters, bounded scans, true new-release dedupe and error isolation
- [x] **8D: Evolution policy** — classify genuine new version vs alias/snapshot/new family; branching lineages, archived forms
- [x] **8E: Original procedural art** — deterministic family-consistent sprites, visual validator, CI contact sheet
- [x] **8F: Gameplay kit compiler** — existing documented-capability mapping, original preapproved passives, bounded fictional stats, simulated battle checks
- [x] **8G: Policy-constrained publisher** — content-only automated PR, source provenance, CI/secret/security and art checks; no unrestricted code self-modification
- [x] **8H: End-to-end unattended preview** — seeded official release fixture appears as a playable evolution at `/next/`, no manual edits, failure/rollback injection
- [ ] **8I: One-time production enablement** — explicit user authorization, default-branch GitHub Actions schedule, least-privilege bot/auto-merge configuration and successful real release drill
- [ ] **8J: ModelDex evolution UX and monitoring** — lineage page, NEW state, version differences, scan health, exception queue and accurate source labels
- [ ] **Gate 8:** valid new official model auto-publishes to static game without per-release manual work while invalid releases are held; zero legacy save/replay breakage

**Important interpretation:** An automation that only creates candidates is an intermediate milestone, not the requested autonomous outcome. The happy path **must publish and expose the evolution without manual labor** once the one-time security and production configuration has been explicitly authorized. Unverified or unsupported models must fail closed, report why and retry safely.

## Per-slice definition of done

Copy below after **actual implementation**:

```text
Phase / slice:
Branch SHA:
Playable or operationally complete user path:
Source files and tests:
Actual unit/integration/E2E command results:
CI URL + conclusion:
Screenshots or animation clips inspected + viewport:
Win / loss / retry / replay evidence:
Save compatibility / model-source provenance:
What changed vs phase plan:
Remaining failure modes / tradeoffs:
Next slice:
```

Keep code simple: **tested whole vertical slices** before broad abstractions. Do not mark a task complete based solely on generated docs, green build without browser play, or workflow mocks without the real publication/recovery pathway. Every mutation restricted to feature branch until separately approved. No overworld, Gauntlet, provider model calls or paid artwork generation in these phases.

## Baseline release risks to keep visible

Physical device UX, sound quality, actual source freshness, production release/rollback and static-preview deployment still require verification in context. Re-read `TASKS.md` and current GitHub Actions before implementation; do not assume an older passing run proves a new commit.


## Implementation evidence and release boundaries (November 20–21, 2026)

**Code completed on feat/battle-evolution:** Hallucination Hydra, Regression Golem and Scope Shifter with original 3px-grid enemy sprites, authored evidence, one-turn inspections, reactive counter penalties, an explicit replanning action, typed events, screen-reader-friendly UI, separate strategy recaps, reproducible PK1 scenario inputs and full move/switch/inspect/replan battle reconstruction. See tests/battle-intelligence.test.ts, tests/e2e/hydra.spec.ts and tests/e2e/intelligence.spec.ts. Legacy campaign and original three challenge achievements stay unchanged. Actual screenshot inspection and final browser pass required before Gate 6 is declared.

**Model evolution code completed:** scripts/lib/evolution-core.mjs; scripts/lib/provider-adapters.mjs; scripts/evolve-models.mjs; generatedModels.json, generatedSprites.json, inventory bootstrap and separate official model identity state; opt-in GitHub Actions publisher in .github/workflows/model-evolution.yml. Source checks use official provider-owned URLs and no inference. First scan snapshots old models; later eligible verified releases compile a distinct original art form, lineage, four balanced fictional moves and a preapproved game passive. Unsourced models are held; historical models are not removed. ModelDex displays NEW EVOLUTION and EVOLVES FROM. Tests cover fixtures, dedup/idempotence, provider adapters, original art, passives and Playwright synthetic-model UI through a separate Generated model smoke CI job. The fixture is fictional and confined to CI, not published as a real model.

**Outstanding before saying "both phases fully done":**
- 6G full green browser/visual CI, a three-seed/roster matrix and physical touch/audio/motion playtesting. The new code has had successful unit/type/build checks in earlier runs; the latest combined SHA still needs verification.
- 8I production activation is opt-in and blocked on approval, official provider listing keys, a scoped GitHub App, branch checks and default-branch workflow deployment. Only then can the scheduled run create and merge its own PR automatically.
- 8J model discovery dashboard/scan health for production and a real observed model release/rollback drill require actual live workflows; a synthetic release test alone does not establish unattended operation.
- Browser preview URL: https://danejw.github.io/Pokaimon/next/. Production main is unchanged.

See PHASE_8_OPERATIONS.md and TEST_PHASES_6_8.md for setup and exact playtest instructions. Gate checkboxes for operational deployment remain intentionally unchecked until that evidence exists.
