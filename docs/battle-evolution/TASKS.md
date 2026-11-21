# Battle Evolution execution tracker

**Status:** ALL FIVE PHASES IMPLEMENTED, AUTOMATED CI AND BROWSER ACCEPTANCE VERIFIED; physical Android QA, production deployment and complete rollout/rollback rehearsal still outstanding. Physical phone QA outstanding. Physical-device QA remains open. Branch: `feat/battle-evolution` from `main` at `70be65c` (Nov 20, 2026). [Draft PR #4](https://github.com/Danejw/Pokaimon/pull/4).
No checkboxes below represent implemented work. Update after verifying commits, CI and actual browser playthroughs, not upon writing documentation.

## Phase 1: Battle System 2.0
- [x] 1A Deterministic squad/switch action with viable test battle
- [x] 1B Distinct resource tradeoffs and player-readable move choices
- [x] 1C Enemy telegraphs + counterplay and limited statuses
- [x] 1D Two-step technique combos and strategy feedback
- [x] 1E Full mobile/desktop battle QA, Easy/Medium/Hard audits and balance sign-off
- [x] **Gate 1:** One complete team-switch battle and one solo win with meaningful different choices; CI + screenshot/playtest evidence

## Phase 2: ModelDex and Team Building
- [x] 2A ModelDex roster/details backed by validated content
- [x] 2B Team editor and persistent selected squad
- [x] 2C Mastery/discovery records from actual battle events
- [x] 2D Unlock/reward flow with backwards-compatible local save migration
- [x] 2E Accessibility, save corruption and device QA
- [x] **Gate 2:** Prepare team, win, discover, reload and see accurate ModelDex/mastery state

## Phase 3: Campaign and Boss Battles
- [x] 3A Campaign chapter map/menu and deterministic mission gating
- [x] 3B Rival trainer with simple explainable tactic patterns
- [x] 3C Multi-phase boss with fair warning, loss and retry
- [x] 3D Rewards, chapter completion and Quick Play preservation
- [x] 3E Full campaign playtest and save/return QA
- [x] **Gate 3: Start chapter, play mission, beat boss, unlock next chapter and resume

## Phase 4: Replayability and Game Feel
- [x] 4A Seeded encounter modifiers with solvability validator
- [x] 4B Repeatable challenges and separate optional challenge tiers
- [x] 4C Achievements/replay summary from battle event history
- [x] 4D Original multi-frame sprite FX, sound cues and animation polish
- [x] 4E Automated mobile/desktop visual QA, reduced-motion and seed replay verification (physical phone QA outstanding)
- [x] **Gate 4 (automated):** Three meaningfully different repeat battles with shareable reproducible seed and polished feedback; physical QA remains a release follow-up

## Phase 5: Living Model Ecosystem
- [x] 5A Separate factual evidence metadata from fictional balance profile
- [x] 5B Versioned validated model registry, asset fallback and migration
- [x] 5C Discovery adapter produces untrusted candidates from official references
- [x] 5D Review workflow + automated checks + safe publish to static bundle
- [x] 5E End-to-end newly-added model browser playtest and regression (code rollback remains a release follow-up)
- [x] **Gate 5 (automated):** Add a sourced model via reviewed catalog data, without editing reducer or per-model UI logic; physical QA/deployment outstanding

## Per-slice evidence template

Copy into this file only when executing a slice:

```text
### Phase X / slice Y / date
Branch HEAD before:
Changed commits / paths:
Playable player path:
Tests first / tests actually run:
CI URL / result:
Screenshots actually opened (resolution + state):
Manual win/loss and input/accessibility evidence:
Known limitations / design tradeoff:
Next slice:
```

**Do not mark a phase finished because its implementation PR merged.** Verify actual behavior. No commitment to dates, paid services, AI provider execution or overworld gameplay.


## Phase 1 evidence (Nov 20, 2026)

**Branch HEAD before gameplay:** `6a78c186`, open Draft PR #4. The plan documents were committed; stable `main` remained at `70be65c`.

**Implemented so far, not a verified release:** `src/battle/types.ts`, `src/battle/engine.ts`, `src/content/core.ts`, `src/battle/tactics.ts`, `src/game/BattlePanel.tsx`, `src/style.css` now include three-companion squad switching (one turn / zero AP), one high-impact two-AP research move, deterministic Code Review guard against turn-two specials, a Research → Verification combo, a compact switch panel and attack telegraph. Pure reducer tests, a 3×5 reachability test, and browser win/guard/combo/squad screenshots were added. This does not include a Phase 2 team editor.

**Observed CI and correction:** Initial browser run [44843995345](https://github.com/Danejw/Pokaimon/actions/runs/44843995345) passed lint/typecheck/unit/AG-UI/build and 42/44 browser tests, failing only the new switched-win test. Its script expected a second Self-Correction after the deterministic battle had already won on turn six; corrected in `7896450`, and parallel unit test aligned in `1dfcdbc`. A separate earlier baseline run [44843273861](https://github.com/Danejw/Pokaimon/actions/runs/44843273861) showed six **stale** browser expectations introduced by earlier versions: old dialogue copy, a locator to a Help section hidden by Medium, and assuming Settings persisted as the active screen on reload. Those expectations were updated in `5810b1a` to reflect actual behavior. No assertions on reducer outcomes were weakened.

**Screenshots actually inspected:** Downloaded artifact `14681559987` from [44843995345](https://github.com/Danejw/Pokaimon/actions/runs/44843995345) and opened `squad-switch-chromium-mobile.png` (360×800) and `squad-switch-chromium-desktop.png` (1280×900) as rendered screenshots. The command bar's switch button, both distinct portrait buttons, AP/turn cost, status HUD and Cancel/Moves affordance are visible and legible. The phone screenshot shows the menu wholly above the viewport bottom with no horizontal clipping. These images predate the later guard/combo UI and are **not** validation of those changes. Also opened older baseline screenshot `battle-chromium-mobile.png` from run `44843273861`.

**Pending gate:** Await a **passing CI run for latest HEAD** covering the advanced reducer tests and both mobile/desktop Playwright flows. Download and actually inspect `guard-counter`, `evidence-combo`, `squad-switch` and `squad-win` screenshots from that exact run; fix any failures. Complete a full win/loss/retreat playtest on 390×844 and desktop; check 360×800 and all three disclosure difficulties. Only then mark 1A–1E complete and begin Phase 2. Do not claim current code is deployed on Pages, and do not merge without explicit approval.

## Verified automated gates for Phases 1 and 2

**Phase 1 verified:** [GitHub Actions 44844735623](https://github.com/Danejw/Pokaimon/actions/runs/44844735623), head `b2d26733`, all lint/typecheck/Vitest/AG-UI/build/Playwright checks passed on desktop and mobile. Screenshot artifact 14682941642 was downloaded and inspected: switched squad menu, victory, guard counter and research combo, each in mobile and desktop. No clipped command buttons seen. Manual physical-device QA remains outstanding.

**Phase 2 verified:** [GitHub Actions 44845686231](https://github.com/Danejw/Pokaimon/actions/runs/44845686231), head `fbf0affa`, all lint/typecheck/Vitest/AG-UI/build/Playwright checks passed. Screenshot artifact 14681829358 was downloaded and visually inspected: `modeldex-chromium-mobile.png`, `modeldex-chromium-desktop.png`, `team-chromium-mobile.png`, `team-chromium-desktop.png`, `mastery-chromium-mobile.png`, `mastery-chromium-desktop.png`. Cards and saved squad controls are legible and not horizontally clipped. Browser tests verified team persisted after reload, invalid one-member team refused, ModelDex rendered original portraits and unlocked alternate Astra loadout changed the actual available moves. Unit tests verified v1-to-v2 migration, corrupted saves and idempotent mastery rewards. Actual physical-device touch UX and authentic provider-source checking have not been established. Static provider documentation links are preexisting content, not live capability verification.

**Implementation changed since roadmap:** Phase 2 local progress uses schema v2 and tracks unique cleared tasks, discovered move IDs and contributing models. It avoids new backends and real inference. Phase 3 should build on v2 with its own backwards-compatible migration.

**No main merge or production deployment was performed by these phases.** The draft PR remains available for review. Automated gates permit progressing to Phase 3 while flagging real-phone testing as an outstanding release risk.

## Phase 3 acceptance (Nov 20, 2026)

**Full suite verified:** [GitHub Actions #44847525790](https://github.com/Danejw/Pokaimon/actions/runs/44847525790) on commit `cc20b3bf` passed lint, typecheck, Vitest, AG-UI, build, and **60 Playwright mobile/desktop tests**. Saved-local campaign supports 3 chapters, 9 missions, three scripted rivals and three bespoke boss phases; Quick Play remains separate, and progress schema v3 migrates v1/v2. Pure `tests/campaign-balance.test.ts` confirms a winning route for each starting companion on every mission. The first 58 of 60 browser tests passed on prior run [44846909393](https://github.com/Danejw/Pokaimon/actions/runs/44846909393); the two failures were a strict Playwright selector matching both the rival and ordinary enemy response, resolved with `.rival-counter` and rerun.

**Actual screenshots opened from final CI artifact `14684625314`:** `campaign-locked-chromium-mobile.png`, `rival-counter-chromium-mobile.png`, `rival-counter-chromium-desktop.png`, `boss-phase-chromium-mobile.png`. The chapter hierarchy, original rival and Scope Giant sprites, counters, and action controls are readable; mobile battle's additional status lines make the full page **taller than the screen**. This is an identified UX improvement for Phase 4, so don't describe every battle as no-scroll. Physical phone audio/touch verification remains outstanding. No production deployment or merge.


## Phase 4 evidence (Nov 20, 2026)

**Existing work discovered at HEAD `f5fae212`:** `src/content/variants.ts` provides three deterministic authored modifiers and a bounded PK1 share code; `src/content/challenges.ts` evaluates three curated objectives from genuine battle events. `src/battle/replay.ts` reconstructs and fingerprints battle state from action records; `src/game/ChallengePage.tsx` offers challenge selection, code entry/copy, earned badges, and last-battle replay. Local progress schema v4 migrates prior saves and records challenge completions and replays. `tests/replay-challenges.test.ts` covers reproducibility, invalid codes, battle reachability, event-defined goals, replay integrity and local persistence.

**Automation evidence:** [GitHub CI run 44849581357](https://github.com/Danejw/Pokaimon/actions/runs/44849581357) completed successfully on `f5fae212`. Downloaded the screenshot artifact `14684194625` and **visually inspected** `challenges-chromium-mobile.png`, `challenge-win-chromium-mobile.png`, `challenges-chromium-desktop.png` and `challenge-win-chromium-desktop.png`. Challenge cards, code controls, results and earned medal are readable and no horizontal clipping was visible in those four images. These are full-page screenshots, not an assertion that the screen fits without vertical scroll. The 1082px-wide mobile capture was scaled by Playwright device pixel ratio and full-page heights were 3229/2292px respectively. The challenge menu is tall on a phone and could benefit from a condensed layout. Motion/audio quality cannot be proven by static screenshots.

**Completion status:** 4A, 4B, 4C have automated evidence. 4D still requires a measured new sprite/sound polish slice and recorded audio/motion test; 4E needs a seed-vs-input manual QA sweep and phone/desktop visual review after any additional changes. Do not claim Phase 4 fully complete or deployed yet.

## Phase 5 implementation underway (Nov 20, 2026)

**Starting point:** `f5fae212`, CI green as linked above. New `src/content/modelCatalog.ts` stores game publication status, separate fictional balance profiles and explicit factual evidence review status. The three existing characters remain playable with their old recorded URLs/dates, currently **pending factual review**, while `core.ts` derives the playable roster from approved catalog entries. A new hypothetical model can use `getModelSprite`'s original generic fallback instead of needing a per-model art/UI switch. Removed three-ID-only casts and the old hardcoded replay restriction, and kept new teams limited to three slots. `ModelDex` no longer says “DOCUMENTATION CHECKED” for the legacy records. Added a no-network, no-cost, **candidate-only** importer at `scripts/prepare-model-candidate.mjs`, test coverage in `tests/model-catalog.test.ts` and `tests/model-candidate.test.ts`, and [MODEL_ONBOARDING.md](MODEL_ONBOARDING.md).

**Verification pending:** The changes above still need a green **final-head** CI run and new mobile/desktop screenshot review. No verified new real-world model was added. Factual capability approval, real-world source checks and a full reviewed release/rollback demonstration remain 5D–5E follow-ups. Do not state Phase 5 complete yet.

**Safety:** Every change is on `feat/battle-evolution`; production `main` has not been changed. Draft PR #4 remains open; no paid model APIs, backend, or unattended publication were introduced.


## Phase 4 game feel and Phase 5 source-backed playable model follow-up

**Phase 4 visible effect:** Added a brief, original dual pixel-burst to `BattleStage.tsx` that triggers only from the reducer's `COMBO_TRIGGERED` event, with existing combo sound played in `BattlePanel.tsx`. Reduced-motion skips the new flash and particles. The Playwright combo flow now checks the `data-combo-sequence` event signal. Actual motion/audio quality and the newest mobile screenshots still require inspection; static screenshots cannot establish animation smoothness.

**Phase 5 evidence review on November 20:** Checked each model identity and conservative stated capabilities against the corresponding provider's official pages. Sources:
- GPT-6.2 Astra: https://developers.openai.com/api/docs/models/gpt-6.2-astra (identity `gpt-6.2-astra`, text/image, reasoning, software and tools)
- Grok 4.7: https://docs.x.ai/developers/models and https://x.ai/news/grok-4-7 (identity `grok-4.7`, coding, reasoning and tool use)
- Claude Fable 5.2: https://platform.claude.com/docs/en/models/fable-5-2/overview (identity `claude-fable-5-2`, text/image, reasoning and agent workflows)
- **New playable Claude Opus 5.5:** https://platform.claude.com/docs/en/models/opus-5-5/overview (identity `claude-opus-5-5`, text/image, adaptive thinking, tool use)

The new Opus creature has a distinct **fictional** technique loadout using the existing move registry and a small original pixel-art fallback. Its registration required editing only the catalog data; the reducer, ModelDex and Phaser use generic IDs and art fallback. Gameplay power scores and matchups are not factual benchmarks; no model API was invoked.

**Tests added or adjusted:** `tests/model-catalog.test.ts` verifies provenance/balance separation, review gate and fallback; `tests/model-candidate.test.ts` rejects malicious/invalid manifest inputs; `tests/roster.test.ts` and team progress tests include the fourth catalog entry while preserving three-member teams; `tests/e2e/battle.spec.ts` includes Opus ModelDex → team editor → battle → win and screenshots; `tests/model-catalog.test.ts` includes replay restoration with a newly registered model. The old Phase 4 replay fixture had passed the entire four-model catalog to a three-member replay schema and caused one Vitest failure on [CI 44857020568](https://github.com/Danejw/Pokaimon/actions/runs/44857020568). The fixture now uses the valid first three-member squad, and a separate new-model replay regression test was added. **The corrected code has not yet passed its final-head CI gate at the time of this note.**

**Pending:** Finish latest head CI, download fresh screenshots (challenge victory, new model on mobile and desktop, combo result), inspect visual regressions, record remaining mobile screen-height tradeoffs, and verify full on-device audio/touch. Source review has been completed for four model identities, but future release discovery is still a manual local-manifest-to-candidate workflow rather than an unattended scheduled discovery system. No automatic model publication or main merge has occurred.


## Phase 4 and Phase 5 integration verification

**Verified code head `d7c88c0`:** [GitHub CI 44857141193](https://github.com/Danejw/Pokaimon/actions/runs/44857141193) passed lint, typecheck, all Vitest tests, AG-UI, production build and mobile/desktop Playwright tests. The prior one-test failure in run 44857020568 was the old 4-model replay fixture violating the explicit 3-member team limit and was fixed before this passing run. Artifact `14688575256` downloaded and actual `new-model-chromium-mobile.png`, `new-model-win-chromium-mobile.png`, corresponding desktop versions, `evidence-combo-chromium-mobile.png`, `evidence-combo-chromium-desktop.png`, and challenge screens were opened as rendered images. ModelDex → team save → Opus model selection → complete TASK victory, combo event wiring, challenge result and replay were exercised by CI.

**Visual observation and correction:** The original generic Opus fallback character appeared **too small** compared with the three existing characters in both initial screenshots. Changed sprite geometry from 16×16 to 32×32 art cells (same original hand-authored motif, crisp 3px pixels), and added a deterministic dimension unit assertion. This later edit **needs a new CI and actual screenshot review**, as earlier passing runs cannot verify it. Challenge menu is readable but still long on portrait phones; fullscreen fit is not claimed. Reduced-motion event guard is in the code; subjective animation and physical audio/playtest remain unverified.

**Publishing limits:** Current importer accepts a local JSON manifest and emits a candidate-only review record; it has no automatic network discovery or recurring scheduler. Manual provider-source review and a PR remain necessary to publish new models. All four selected model facts were checked against dated official sources; game scores and outcomes are simulated. No service credentials, paid model execution or merge were introduced. This is a **static bundle workflow**, not a claim of automatic discovery/publishing. Physical-phone QA and any rollback rehearsal on a deployed preview remain outstanding. Keep final exit gates unchecked until verified.


## Final branch verification (November 20, 2026)

**Successful latest gameplay + docs CI:** [GitHub Actions 44857715892](https://github.com/Danejw/Pokaimon/actions/runs/44857715892) passed all required lint/typecheck/Vitest/AG-UI/build/Playwright steps for HEAD `cd26d0cf`. After the first valid end-to-end run [44857141193](https://github.com/Danejw/Pokaimon/actions/runs/44857141193) exposed a small original fallback creature relative to existing sprites, the fallback source was scaled from 16×16 to 32×32 art cells and its dimensions were added to unit tests. The corrected run passed, and screenshot artifact `14688665717` was downloaded. **Actually opened and visually inspected** `new-model-chromium-mobile.png`, `new-model-win-chromium-mobile.png`, desktop equivalents, `evidence-combo-chromium-mobile.png` and desktop equivalent. The new Opus companion is now visually proportionate to the original three; status, attacks, result and combo medal are legible without horizontal clipping. Full-page portrait battle images can extend below the first fold, and challenge menus still require vertical scrolling.

**Functional gate:** all five roadmap phases are available on `feat/battle-evolution`. Automated tests cover deterministic squad switching, strategy, ModelDex, team saves/migrations, 3-chapter campaign, seeded scenario codes, challenge scoring, replay integrity, newly registered documented model and generic sprite fallback. No live provider executes a task. The model candidate workflow emits **unpublished review candidates** from a local manifest; automated online discovery and one-click publication are not included.

**Release holdbacks:** physical phone audio/touch/haptics not manually tested; no separate no-scroll guarantee for a tall battle; automatic network discovery wasn't introduced; a full production rollback drill hasn't been run; PR #4 remains draft and is **not merged or deployed**. The "completed" boxes above mean code and automated acceptance, **not** these outstanding field/release checks. Keep production `main` unchanged until explicit direction.
