# Battle Evolution execution tracker

**Status:** PLAN COMPLETE / IMPLEMENTATION NOT STARTED. Branch: `feat/battle-evolution` from `main` at `70be65c` (Nov 20, 2026). [Draft PR #4](https://github.com/Danejw/Pokaimon/pull/4).
No checkboxes below represent implemented work. Update after verifying commits, CI and actual browser playthroughs, not upon writing documentation.

## Phase 1: Battle System 2.0
- [ ] 1A Deterministic squad/switch action with viable test battle
- [ ] 1B Distinct resource tradeoffs and player-readable move choices
- [ ] 1C Enemy telegraphs + counterplay and limited statuses
- [ ] 1D Two-step technique combos and strategy feedback
- [ ] 1E Full mobile/desktop battle QA, Easy/Medium/Hard audits and balance sign-off
- [ ] **Gate 1:** One complete team-switch battle and one solo win with meaningful different choices; CI + screenshot/playtest evidence

## Phase 2: ModelDex and Team Building
- [ ] 2A ModelDex roster/details backed by validated content
- [ ] 2B Team editor and persistent selected squad
- [ ] 2C Mastery/discovery records from actual battle events
- [ ] 2D Unlock/reward flow with backwards-compatible local save migration
- [ ] 2E Accessibility, save corruption and device QA
- [ ] **Gate 2:** Prepare team, win, discover, reload and see accurate ModelDex/mastery state

## Phase 3: Campaign and Boss Battles
- [ ] 3A Campaign chapter map/menu and deterministic mission gating
- [ ] 3B Rival trainer with simple explainable tactic patterns
- [ ] 3C Multi-phase boss with fair warning, loss and retry
- [ ] 3D Rewards, chapter completion and Quick Play preservation
- [ ] 3E Full campaign playtest and save/return QA
- [ ] **Gate 3:** Start chapter, play mission, beat boss, unlock next chapter and resume

## Phase 4: Replayability and Game Feel
- [ ] 4A Seeded encounter modifiers with solvability validator
- [ ] 4B Repeatable challenges and separate optional challenge tiers
- [ ] 4C Achievements/replay summary from battle event history
- [ ] 4D Original multi-frame sprite FX, sound cues and animation polish
- [ ] 4E Mobile visual QA, reduced-motion and seed replay verification
- [ ] **Gate 4:** Three meaningfully different repeat battles with shareable reproducible seed and polished feedback

## Phase 5: Living Model Ecosystem
- [ ] 5A Separate factual evidence metadata from fictional balance profile
- [ ] 5B Versioned validated model registry, asset fallback and migration
- [ ] 5C Discovery adapter produces untrusted candidates from official references
- [ ] 5D Review workflow + automated checks + safe publish to static bundle
- [ ] 5E End-to-end newly-added model playtest, regression and rollback rehearsal
- [ ] **Gate 5:** Add a model through metadata/configuration + review, without editing reducer or UI logic

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
