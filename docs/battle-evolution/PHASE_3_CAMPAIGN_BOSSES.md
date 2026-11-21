# Phase 3: Campaign and Boss Battles

**State:** Planned, not implemented. **Requires:** Phase 2 squad, mastery and persistent progress. **Exit:** a player follows a real sequence of linked challenges, faces a rival and a multi-phase boss, earns a chapter reward, and resumes it later. **No walking overworld.**

## Player experience

The Home screen offers **QUICK PLAY** (today's one-click random wild encounter) and **CAMPAIGN** (a compact chapter menu). Campaign Episode 1 asks the trainer to handle a troublesome workflow: interpret an ambiguous task, choose a capable team, respond to a rival's strategy, and defeat a boss that changes requirements mid-battle. Clear missions to unlock the next chapter and a meaningful ModelDex reward. Fail and retry with a different squad without losing earlier victories.

This introduces a sense of adventure and stakes without building maps, navigation or a narrative engine.

## Content and presentation

**Initial target:** three short chapters, each with two normal missions and one boss/rival challenge. Ship a fully playable **Chapter 1** before authoring Chapters 2–3. Existing five encounters can be reused with well-labeled stage variations; add new definitions only when they make battles distinct.

Illustrative themes, subject to gameplay tests:
- **Chapter 1: The Workshop:** TASK and BUG lead to `SCOPE GIANT`, a boss whose late stage demands independent verification. Teaches planning, execution, checking.
- **Chapter 2: The Evidence Lab:** RESEARCH REQUEST and HALLUCINATION lead to `FALSE SIGNAL`, which plants contradictions and forces corroboration.
- **Chapter 3: The Logic Arena:** MATH PROBLEM and a new mixed-capability encounter lead to `THE ADAPTIVE TRIAL`, which changes tactics based on a clear deterministic rule.

These are proposed game names, not claims about AI providers. If alternate tasks are too similar, revise the encounters before increasing content count.

## Domain design

- `CampaignDefinition`: stable chapter/mission IDs, display title, short objective, recommended but not mandated difficulty, encounter reference, unlock prerequisites, explicit reward definition.
- `CampaignState`: ordered completed mission IDs and active chapter plus claim flags. Keep results derived from authoritative battle completion events; no manual "completed" switch.
- `OpponentBehavior`: a small deterministic script/state machine: before a turn announce intent, next turn resolve based on player action/status. Reuse Phase 1 combat events; no opponent AI API and no random prompt generation.
- `BossDefinition`: deterministic phase thresholds (e.g. after two completed stages or a progress milestone), phase description, one special rule per phase, explicit transition event. Reuse the same BattleState/progress model; avoid introducing separate boss-only reducer.
- **Rewards:** use Phase 2's unlock/milestone mechanism. Never unlock a model record that is missing, unsourced, unsupported or lacks original art/fallback.
- **Saves:** add versioned mission completion to progress; preserve Phase 2's roster + mastery and historical cleared encounters. Quick Play continues recording base encounter clears.
- **Difficulty remains disclosure-only** across campaign; challenge tier becomes an optional distinct mechanic in Phase 4. A mandatory story boss must remain beatable on every information difficulty.

## Serial implementation slices

### 3A. The first chapter menu and its first mission

Add CAMPAIGN on Home, a short chapter list/detail with mission states `locked / available / cleared`, real battle launch and return path. Reuse a current encounter for the first mission. Let Quick Play retain its existing behavior and easy entry.

**Likely paths:** `src/App.tsx`, `src/content/campaign.ts` (new only when needed), `src/storage/progress.ts`, `src/game/BattlePanel.tsx` (pass campaign context through callbacks), `tests/e2e/battle.spec.ts`, new `tests/campaign.test.ts`.

**Tests first:** new save starts at Chapter 1 mission 1; finishing exact mission unlocks next; loss does not; entering Quick Play does not automatically progress campaign; back/home preserves selection; completing a mission from a fresh instance reloads unlocked state. Existing Home PLAY still works or is clearly relabeled QUICK PLAY.

### 3B. An actual rival trainer

Create one **original fictional rival** with a named preferred tactic, visible creature on opposing side or an overlay that doesn't clutter the existing canvas, and an encounter-specific opponent behavior table. A rival is a strategy to overcome, not a branded AI-provider ranking.

**Example:** rival chooses repeated high-tempo moves but ignores verification. Player wins by planning counterplay, not by buying stronger stats. Outcome is simulated and deterministic.

**Tests:** rival action sequence has explainable telegraph, same seed/actions give same outcome, invalid enemy move/behavior fails safely, player can win with at least two squad compositions, losing gives useful non-spoiler feedback. All audio/visual cues have readable text equivalents.

### 3C. The boss that changes the problem

Implement first story boss using **existing three-stage mechanics** with scripted transitions at defined events and a warning before a dangerous move. Boss phase change is visible: unique original sprite frame/palette, dialogue, status and battle music cue if sound on.

**Tests:** phase transition fires exactly once; guard/switch/counter strategies work; no untelegraphed softlock, stage goals stay bounded, winning requires actually completing the stages, no result granted after failure or page leave. Cover Easy/Medium/Hard information hierarchy. A defense should never rely solely on guessing a hidden timer.

### 3D. Chapter conclusion and new options

Connect Chapter 1 normal missions → rival/boss → chapter results → next chapter + a small playable reward (e.g. alternate move configuration/appearance). Only then author Chapter 2 and 3 using existing content contracts. Mission-select UI should be mostly data-driven, not three separate pages coded individually.

**Tests:** repeated boss win doesn't duplicate reward, final chapter clear unlocks appropriate content, Quick Play remains available, save migration works, explicit reset does what it says without erasing settings.

### 3E. Full campaign QA

Play first-time campaign on phone portrait and desktop; intentionally fail midway; switch squads, retry, win; reload on chapter select; revisit old missions. Confirm no hidden controls or impossible chapter when using all valid starter teams, and no timeline inflation from unnecessary cutscenes.

**Balance gate:** chapter 1 has at least one surprise and one "I learned something" moment based on decisions; a player can understand what happened in one battle log after loss. Keep story text brief enough to maintain fast replay.

## Exit gate and exclusions

**Done when:** Chapter 1 is completely playable and a repeatable authoring path exists for later chapters, plus an approved set of 3 chapter endings is implemented and verified. If remaining chapters aren't implemented, mark Phase 3 **in progress**, not done. Full campaign includes 3 chapters and at least three distinct boss/rival patterns, with QA and proof in [TASKS.md](TASKS.md).

**Not now:** walkable routes, NPC pathfinding, inventory/crafting system, branching cinematics, cloud saves, online rivals, arbitrary model-versus-model live calls or voice-acted cutscenes.
