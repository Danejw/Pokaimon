# Pokaimon Phase 6 and Phase 8: Test guide

## Play the battles now

Open https://danejw.github.io/Pokaimon/next/ and choose CHALLENGES. The three featured Intelligence Trials are separate from the three original challenge achievements. They do not erase your existing campaign or locally saved teams.

**Hydra:** Pick HALLUCINATION HYDRA, then GPT-6.2 Astra. Click Inspect Source Provenance / Inspect Tactical Evidence to reveal that the cited sources share one origin. Follow with Deep Think, Deep Research, Self-Correction. Expect a win with no Echo Chamber penalty. Retry and skip inspection; use Deep Think, Deep Research, Self-Correction twice. Expect the Echo Chamber penalty but a recoverable win. Confirm the strategy report describes your choice.

**Regression Golem:** Click GOLEM TRIAL, choose Astra, inspect the failure trace, then use Deep Think, Code Execution, Self-Correction. Expect a clean verified victory. Retry without inspection: the Golem adds a regression after Code Execution and a second Self-Correction is necessary.

**Scope Shifter:** Click SCOPE TRIAL, choose Astra, use Deep Think without checking requirements. Expect Scope Creep and an explicit REPLAN action. Choose REPLAN, then Code Execution and Self-Correction. Expect the changed acceptance criteria to be resolved. Retry: first inspect the requirement note, then use Deep Think, Code Execution, Self-Correction. The early clarification should avoid rework.

Check desktop and phone widths for no horizontal clipping, visible action labels, readable clue panel, keyboard focus and a usable return-home control. Toggle Settings → Reduced motion and Sound OFF and repeat an encounter. Reload the page to ensure earlier campaign/challenge progress survives. These are simulated AI tasks, not real model calls.

## Test autonomous evolution

The repo's separate GitHub CI job called Generated model smoke creates a synthetic, fictional model ONLY in its disposable runner. It runs the candidate-to-evolution compiler, validates an original sprite, builds the site, uses Playwright to navigate ModelDex and its evolutionary parent, edits the team, and wins a TASK battle.

Open the latest successful Web app CI run at https://github.com/Danejw/Pokaimon/actions and inspect the Generated model smoke job and its synthetic-evolution-ui-screenshots artifact. That is the safe immediate end-to-end test even before real providers issue a new model. No fictional model is automatically published to the live preview.

For a developer-local full demonstration, first clone and check out feat/battle-evolution, install Node 22 and npm dependencies in an isolated working tree. Then initialize a temporary observation baseline for the fixture, run the fixture importer and start npm run dev. Do not commit its generated synthetic catalog as a real provider release.

Once the production publishing configuration has been separately approved, follow PHASE_8_OPERATIONS.md to test official provider discovery, a real newly listed model, source-gated publication, default-branch scheduling, and rollback. Until those credentials/permissions exist, the live automation cannot operate.

## Acceptance record

Record the exact commit, latest passing CI link, browser/phone, pass/fail for each strategy, model lineage screenshot and any skipped production tests in NEXT_EXPANSION_TASKS.md. A code check passing without physical mobile play or a real new release is not evidence those two real-world checks occurred.
