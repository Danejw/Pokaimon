# Phase 4: Replayability and Game Feel

**State:** Planned, not implemented. **Requires:** completed Phase 3 campaign and reusable enemy scripts, reward/event logging. **Exit:** short battles feel varied, replayable and satisfying with original pixel effects/audio and deterministic reproducibility.

## Player experience

Players choose **Wild Battle** for fast encounters or **Challenge** to attempt a constrained run, such as "win while using two companions" or "verify a conflicting source within five actions." Encounter variations and stage order are diverse enough to demand strategy without reading an essay. The result shows what tactic worked, how much AP/time it cost and a small new discovery or badge. Players can copy a seed/code to replay a challenge locally; no online leaderboard is needed.

## Design: authored templates plus seeded variation

- Use current `EncounterDefinition` and Phase 3 opponent patterns as templates. A *seed* produces small controlled variations: enemy special, stage order where logically valid, different modifiers, turn/AP limits, or optional side objective.
- Only allow combinations on a curated whitelist or after an automated solvability check using Phase 1's reducer. A generated encounter may be hard; it must never be impossible for all available teams without clear warning.
- Seed, content version, base encounter ID, chosen team and ordered player actions reconstruct the same outcome. **Current `BattleState.seed` exists but is not used for randomness; this phase is where seeded variation becomes real.**
- Avoid arbitrary procedural narratives and external LLM generation. A handful of well-authored challenge patterns with readable variations is enough at first.
- A **challenge tier** (Standard / Expert etc.) can explicitly modify AP/turn caps or enemy behavior. This is distinct from **Easy/Medium/Hard disclosure difficulty**; a Hard-disclosure player should not unknowingly fight a stronger enemy.
- Daily challenge is optional: a deterministic date-to-seed mapping (specified UTC date), with no user tracking, remote sync or deceptive claim of global shared scores.

## Serial implementation slices

### 4A. Deterministic variation from one battle template

Add a pure `makeEncounter(templateId, seed, modifierIds)` that returns an immutable scenario snapshot, plus validators. Do not replace current Quick Play. Start with two useful modifiers on two current encounters, such as a final extra verification step and an enemy turn timing variant.

**Likely paths:** `src/content/encounters.ts`, `src/battle/engine.ts`, new `src/content/variants.ts` if useful, `tests/encounters.test.ts`, `tests/battle.test.ts`.

**Tests first:** same seed/version/options yields identical scenario and event log; seeds differ within constrained content pool; all expected stages valid; action search finds at least one winnable sequence; no negative goals/zero AP/invalid capability; no mutation of shared template. Run matrix across available squads and interesting seeds.

### 4B. Replayable challenge cards

Add a small challenge menu that offers a few curated constraints with difficulty-independent description. Track success using actual battle events and a stable challenge ID; "win while switching twice" must be verified from the event log. Incomplete/failed challenge should have a real failed state and retry.

**Tests:** challenge objective is enforced, cannot be collected in Quick Play accidentally, reload preserves cleared challenge, reset behaves appropriately, keyboard/touch can choose and launch challenge. Nonexistent/retired challenge IDs don't crash.

### 4C. Replay and achievement summary

Capture `BattleReplay`: `formatVersion`, `contentVersion`, `encounterId`, variant seed, initial team, action IDs and expected final result/checksum. Keep it compact, JSON-safe, storage bounded. Replaying should call pure rules from the same snapshot; animations can be skipped or played at adjustable speed if easy.

**Player-facing:** an end-of-battle recap highlights an effective technique chain or learned counter rather than simply a big score. `COPY CHALLENGE CODE` copies a safe short code of seed + scenario; optionally `WATCH REPLAY` after basic reconstruction is verified. Never suggest replay is evidence that a real AI executed a task.

**Tests:** exact reproduction of state/events, version mismatch shows graceful unsupported-replay message, malformed/oversized replay import rejected, no arbitrary HTML/code execution, clipboard failure handled, no sensitive content serialized.

### 4D. Make each action feel impactful

Spend effort on **original** animation and audio using current `BattleStage.tsx`, `PixelPortrait.tsx`, `sound.ts`, `music.ts`, and sprites. Add one distinct wind-up/impact/recovery sequence for each ability category, meaningful enemy stagger, phase-change pose, status icon, and a satisfying reward cue. Limit animations to short precise frames; allow speed-up and reduced-motion.

**Tests:** frame/phase driven by reducer events, no double-resolve during overlapping animations, audio context reuse, mute works immediately, reduced-motion still shows result and text, no heavy initial asset payload or mobile frame hitch. Inspect screenshot and short recording evidence of transitions (static screenshots alone cannot prove animation quality).

### 4E. Replayability and accessibility audit

Play at least three seeds from each featured template plus every curated challenge tier. Compare balance and failure recovery. Measure time-to-first-move, battle duration, menu friction, overflow and obvious frustration. Use same UI across Easy/Medium/Hard; avoid exposing hidden "correct answers" through button tooltips or assistive names on Medium/Hard.

**Tests:** seeded play reproducible in Vitest and Playwright, touch/keyboard focus survives replay, no layout clipping at 360×800 and 390×844, desktop 1280×720, muted/reduced-motion result still intelligible.

## Exit gate and exclusions

**Done when:** at least three replayable battle variants feel meaningfully different, one challenge can be repeated from a seed/code with the exact deterministic result, achievements are accurate, and special move/counter moments have professionally readable original FX/audio. All CI, mobile/desktop screenshots and motion/audio checks are recorded.

**Not now:** network leaderboards, social sharing requiring accounts, realtime co-op, streaming replays, arbitrary text-to-enemy generation, monetization, or huge art bundles. Keep game load small and static.
