# Pokaimon next expansion: Phase 6 then Phase 8

**Status:** planning approved, implementation NOT started. **Source of truth:** [Phase 6](PHASE_6_BATTLE_INTELLIGENCE.md) and [Phase 8](PHASE_8_AUTONOMOUS_MODEL_EVOLUTION.md). This tracker is for the new post-Battle-Evolution work; [TASKS.md](TASKS.md) records the previous Phase 1–5 implementation. Phase 7 Gauntlet is intentionally deferred; Phase 8 follows Phase 6 directly.

**Branch:** `feat/battle-evolution`; keep production `main` untouched. Current Phase 1–5 preview is `/Pokaimon/next/`. The new documents are plans, not evidence that code exists.

## Phase 6: Battle Intelligence 2.0

- [ ] **6A: Discoverable tactical clues** — a Hallucination Hydra clue and two genuine choices with different reducer consequences
- [ ] **6B: Reactive enemy intent** — telegraphed policy, at least one actual counterplay, typed events, UI feedback
- [ ] **6C: Multiple routes and recovery** — two different wins, a recoverable mistake and a losing path; deterministic solver matrix and replay
- [ ] **6D: Regression Golem** — authored hypotheses, risky patch, regression, tested-fix win and alternate win
- [ ] **6E: Scope Shifter** — changing requirements, early clarification vs adaptive replanning, resource tradeoffs
- [ ] **6F: Presentation and game integration** — original art/FX/audio, evidence notebook, strategy recap, challenge and progress compatibility
- [ ] **6G: Balance and phase gate** — three memorable bosses, two verified wins each, seed/roster matrix, manual full playthroughs, mobile/desktop/keyboard/reduced-motion, CI
- [ ] **Gate 6:** play all three complete battles with meaningful strategy and no legacy regressions

Do not start Phase 8 until Gate 6 has passing automated checks and actual screenshot/representative play evidence.

## Phase 8: Autonomous Living Model Evolution

- [ ] **8A: Versioned model lineage** — immutable official IDs, evolution/branch relationships, save and replay compatibility
- [ ] **8B: First trusted provider adapter** — fixtures, official model listing + evidence check, idempotent candidate detection
- [ ] **8C: OpenAI, Anthropic, xAI** — independent adapters, bounded scans, true new-release dedupe and error isolation
- [ ] **8D: Evolution policy** — classify genuine new version vs alias/snapshot/new family; branching lineages, archived forms
- [ ] **8E: Original procedural art** — deterministic family-consistent sprites, visual validator, CI contact sheet
- [ ] **8F: Gameplay kit compiler** — existing documented-capability mapping, original preapproved passives, bounded fictional stats, simulated battle checks
- [ ] **8G: Policy-constrained publisher** — content-only automated PR, source provenance, CI/secret/security and art checks; no unrestricted code self-modification
- [ ] **8H: End-to-end unattended preview** — seeded official release fixture appears as a playable evolution at `/next/`, no manual edits, failure/rollback injection
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
