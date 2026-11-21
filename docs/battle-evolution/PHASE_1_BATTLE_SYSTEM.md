# Phase 1: Battle System 2.0

**State:** Planned, not implemented. **Depends on:** merged November 20 stable game. **Exit:** one complete fun battle with tactical model switching, distinguishable move choices, an enemy response, a counter-strategy, and a repeatable outcome on all input modes.

## Player experience

A wild BUG arrives. Its opening step needs diagnosis. The player may start with a reasoning-oriented companion, then switch to a coding-oriented companion to apply the repair, then choose verification. A rival approach keeps one model on the field, spending different moves to reach the same goal. Enemy attacks can disrupt either route, so reading events and adapting matters. Easy reveals move forecast, Medium shows techniques without precise effectiveness, Hard demands observation and experimentation.

**Intended source of depth:** tradeoffs among current squad, AP, turns, stage needs, temporary states and enemy responses. Simply selecting the unique green move every turn is not a full game. Damage/power remains fictional game math.

## Current system to evolve

- `BattleState` in `src/battle/types.ts` has one `modelId`, one AP pool (6), at most eight turns, stage progress and events. `applyMove` requires a matching model and currently cannot switch.
- `src/game/BattlePanel.tsx` selects a model exactly once before summoning and displays its four moves. `src/battle/engine.ts` handles the single-model action; enemy special triggers on turn 2.
- `src/battle/tactics.ts` forecasts matching move power and stage completion without touching the reducer. `src/storage/preferences.ts` controls disclosure.
- `src/content/core.ts` already defines three model loadouts and the moves registry. Focus/tempo/precision are stored but not a reason by themselves to claim performance superiority.

## Rules proposal (subject to 1A balance test)

- **Squad:** for Phase 1, offer all three existing models in battle. Start with any one; each keeps its original four-move loadout. No team editor until Phase 2.
- **Actions:** `UseMove(moveId)`, `SwitchModel(modelId)` as discriminated union. Keep a backwards-compatible `applyMove` adapter for existing tests/callers until UI migrates. All commands validated in one pure reducer; invalid actions change nothing.
- **Switch economy:** switching to a different squad member consumes **one turn, zero AP**; cannot switch to the active member or after battle end. Enemy schedule advances on switch. This preserves six AP for tactics while making swaps meaningful; benchmark win probability with and without switching before finalizing. On-switch effects intentionally absent for 1A.
- **AP/turn rules:** use existing AP=6 and turn limit=8 initially, but expose values as balance constants. Do not silently inflate AP for certain models. Each move displays its cost; existing moves cost 1 AP. Higher-cost options are justified only by real strategic advantages and solvability tests.
- **Statuses:** begin with at most two temporary statuses, e.g. `exposed` (target takes modest bonus progress from next eligible move) and `guarded` (prevents one enemy penalty). Every status has one clear source, bounded duration, UI indicator, consumed/expired event, and deterministic priority. No random criticals or invisible stacks.
- **Counterplay:** enemy intent announced before a threat resolves where possible. At least one encounter offers a meaningful response (guard, verify or switch) beyond simply accepting a fixed penalty. Preserve encounter-specific turn-two specials but refactor triggers only if tests prove new schedule fair.
- **Combos:** create one or two teachable technique pairs such as `Research -> Verify` or `Diagnose -> Code` using temporary setup tags. Bonus applies once, expires quickly, and cannot skip the requirement to do real verification. Outcome/move text explains the causal connection. Do not pretend to have executed research or code.
- **Event provenance:** add event kinds for `MODEL_SWITCHED`, `STATUS_APPLIED`, `STATUS_CONSUMED`, `COMBO_TRIGGERED`, and `ENEMY_INTENT` only if the slice consumes them. Events drive narration, future replays and tests. Avoid parsing messages for logic.
- **Difficulty:** Easy may reveal upcoming interactions, Medium hides the optimal answer and numbers, Hard hides forecasts but retains observable action feedback. All three must receive **the same battle rules** given identical actions/seed.

## Serial implementation slices

### 1A. The switch that changes a fight

**First playable slice:** add squad IDs + active model to state and pure switch action, simple `SWITCH` option next to moves, animated summon transition reusing current art, updated AP/turn HUD and event feedback. Keep all existing moves/stages intact.

**Likely files:** `src/battle/types.ts`, `src/battle/engine.ts`, `src/game/BattlePanel.tsx`, `src/game/BattleStage.tsx` (reuse animation), `tests/battle.test.ts`, `tests/e2e/battle.spec.ts`. Only add `src/battle/actions.ts` if it materially simplifies the reducer.

**Acceptance tests first:**
- Switching `astra -> grok` updates active ID, increments turn once, leaves AP and stage progress unchanged, emits exactly one switch event; `grok -> grok` and unknown IDs are rejected.
- Model-specific move use is checked against **current active model**. A move previously equipped by the prior model cannot be used when switched away.
- Enemy turn-two action triggers deterministically whether turn 2 is reached by move or switch.
- A short scripted win using at least one switch remains possible within AP/turn limits; a no-switch path also remains possible.
- Phone and keyboard can open squad, switch, continue, win/lose/retry; no menus are obscured at 360×800 or 390×844.

**Playtest decision:** if switching consumes too much of the eight-turn budget, adjust one clearly measured parameter, not three at once; keep the decision meaningfully costly.

### 1B. Moves that ask for judgment

Differentiate two moves in the same category: one efficient but expensive, another safer or a setup move. Implement a *minimal* type-safe effect record instead of hardcoding names in React. Make real tradeoffs observable from events and visible costs. Existing nine moves should remain valid without explicit effects.

**Tests:** same move can have different consequences based on stage/status, AP cannot drop below zero, a high-cost move can be unavailable, neither a dominant nor universally useless new move exists across a scenario matrix. All three modes hide/reveal only the appropriate guidance.

### 1C. Enemy intent and fair response

Enemy intent is a pure event/field, telegraphed prior to execution. Add one enemy behavior whose outcome depends on player action. Include a no-counter outcome and a countered outcome. Keep event timing deterministic and allow a missed defense.

**Tests:** identical seeds/actions produce byte-equivalent state/events; effect resolves exactly once, no status persists across retry, defeat happens fairly when AP/turn exhausted. Accessibility announces threat without flashing-only feedback.

### 1D. Technique combo

Ship **one** useful combo attached to a current encounter, with a distinct battle cue and a short post-turn lesson. Provide at least one reasonable alternate route so that combos are not mandatory or always optimal. Add a second combo only after first one plays well.

**Tests:** setup expires, combo only fires after a valid follow-up, no repeated stacking, progress remains capped by remaining stage goal, battle lesson names which *simulated technique chain* worked.

### 1E. End-to-end balance and feel

Run reproducible scenarios for all **3 starter models × 5 existing encounters × 3 display difficulties**, including switching and losing. No unwinnable random starter pairing without a visible switch route. Inspect portrait and desktop turn HUD, status icons, multi-action command layout and result. Sound/motion must remain optional.

**Required QA:** complete wins with and without switching; forced switch failure; deliberate wrong moves; turn cap; extra verification; keyboard arrow controls; touch target sizes; reduced motion; back/retry; no scroll overflow.

## Design validation questions

- Can a player explain why they switched and whether that decision helped?
- Can they recover from one mistaken choice without being forced into restart?
- Does Hard teach by observation rather than conceal all feedback?
- Do model identities produce distinct **gameplay** without falsely implying objective provider rankings?
- Does one attack type dominate? Use an automated scenario matrix and at least two human-style playthroughs to tune.

## Exit gate and exclusions

**Done when:** the first full encounter involving a deliberate switch, enemy counter, and optional combo is independently winnable, deterministic, readable and satisfying; the solo route also works; all existing battle, settings, model selection, and AG-UI tests pass; screenshots have been inspected. Record exact commits/CI/playtests in [TASKS.md](TASKS.md).

**Not now:** collecting models, campaign progression, random challenge generation, meta-progression economy, provider/API calls, generic status-effect engines or dozens of new moves. Phase 2 supplies the squad editor; Phase 4 supplies broader procedural variations.
