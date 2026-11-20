# Pokaimon MVP status

Updated 2026-11-19 (HST). Based on the design and implementation plan in this folder.

## Five serial vertical slices

Each phase was introduced as a separate feature commit. Small follow-up CI fixes were committed separately, without rewriting history.

| Phase | Feature commit | Verified checkpoint | What was added |
| --- | --- | --- | --- |
| 0 | [9c81f746](https://github.com/Danejw/Pokaimon/commit/9c81f7467c8185d7ccc12785c56a59f65ed2b211) | [e837348f](https://github.com/Danejw/Pokaimon/commit/e837348fdf27063090e4920b4e7ced0f4d3222b2) | React, Phaser, mobile app shell, settings and CI |
| 1 | [d1858d20](https://github.com/Danejw/Pokaimon/commit/d1858d2079be7b8861224277ab8eb1f1e6b2cb96) | [6a72f5b3](https://github.com/Danejw/Pokaimon/commit/6a72f5b3baff23f1f5ca688fca6b7b74bb86f743) | Deterministic TASK battle, four moves, win/lose/retry |
| 2 | [10a0c67a](https://github.com/Danejw/Pokaimon/commit/10a0c67af2785584da55bb463aae548f95025d6a) | [406a4e8e](https://github.com/Danejw/Pokaimon/commit/406a4e8e739577306f311f11ad1d5e350fea34ce) | Three AI characters, original drawings and move loadouts |
| 3 | [238b28cb](https://github.com/Danejw/Pokaimon/commit/238b28cb3a5cb651ef4ed791c0eb234997c77e57) | [6f53a525](https://github.com/Danejw/Pokaimon/commit/6f53a5250051c7ba74367bd344ace94651ee92fc) | Five enemies, progression, local saves and Field Guide |
| 4 | [a08dfe2f](https://github.com/Danejw/Pokaimon/commit/a08dfe2faf226d55cd88b20efafe3423ccedf9de) | [bf8b50b2](https://github.com/Danejw/Pokaimon/commit/bf8b50b255bc3ea669701b3c83b0d05f80860894) | AG-UI streaming endpoint and SDK, live-provider adapter contract, synthesized sound, accessibility improvements |

## Verified versus outstanding

Automated checks passed for every checkpoint. Phase 4 CI includes lint, typecheck, Vitest unit/integration tests, AG-UI 1.0 official-client tests, app build, and Playwright mobile/desktop browser tests. See [passing Phase 4 CI](https://github.com/Danejw/Pokaimon/actions/runs/44680548697).

**Implementation status:** Web MVP code complete and passing CI. Battles simulate educational capability use; no real AI model executes a task and no paid inference occurs. The AG-UI server is runnable locally and is not deployed to static GitHub Pages.

**Public deployment:** Blocked by GitHub Pages repository settings. The workflow cannot create the Pages site with its current integration permissions. The owner must set [Settings -> Pages -> Build and deployment -> GitHub Actions](https://github.com/Danejw/Pokaimon/settings/pages), then rerun [Deploy Pokaimon Pages](https://github.com/Danejw/Pokaimon/actions/workflows/pages.yml).

**Manual QA:** Physical Android playback and design review remain pending. Automated mobile browser emulation is not proof of a real device playtest. Trademark clearance for public marketing, full audio/design polish, and a dependency lockfile also remain later quality tasks.

## How to test

Once GitHub Pages is enabled and the deployment workflow reports success, the anticipated project URL is https://danejw.github.io/Pokaimon/ . Do not assume this address is live until verified.

Open the app on Android, select PLAY -> TASK -> GPT-6.2 Astra, use Deep Think, Code Execution, Self-Correction and Self-Correction. Confirm victory and the lesson, then return to Challenges and verify BUG unlocks. Reload to confirm saved progress. Try six ineffective moves to trigger defeat and retry. Switch to Grok 4.7 or Claude Fable 5.2 to check their unique moves. Open Field Guide and Settings.

For developer testing run npm install, npm run lint, npm run typecheck, npm run test, npm run test:agui, npm run build, and npm run test:e2e. The local AG-UI simulation needs npm run dev:agent alongside npm run dev.

## Scope boundaries

AG-UI standardizes agent-to-UI events, not raw model API compatibility. Provider adapters for actual model calls, user authorization, budget limits, evidence evaluation and real task results are post-MVP features. Current in-game character stats are fictional balancing and are labeled as such.
