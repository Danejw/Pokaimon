# Phase 2: ModelDex and Team Building

**State:** Planned, not implemented. **Requires:** accepted and verified Phase 1 switching/action economy. **Exit:** players can inspect documented AI companions, assemble a usable squad, discover tactical mastery, unlock meaningful options, and reload without losing progress.

## Player experience

Between battles, open the **ModelDex**. Each model has an original pixel portrait, four visible techniques, game role, strengths and limitations, provider/version, and linked official source. The player sees which strategies they have actually used, changes their three-slot squad, and takes that squad into the next encounter. Completing a distinct battle tactic unlocks a reward that changes play, such as an alternate loadout or technique; it cannot award nonexistent real models.

ModelDex must separate **simulated gameplay stats** from **sourced factual model metadata**. Display freshness of documentation where useful; no leaderboards claiming one model is empirically best.

## Source-of-truth and data boundaries

Existing `src/content/core.ts`: 3 records in `MODELS`, a shared `MOVES` registry, fixed four equipped moves per model and source URL + verifiedAt. `PixelPortrait` currently expects three hard-coded creature IDs. Existing `src/storage/progress.ts` saves only `{schema:1,cleared:string[]}`. `src/App.tsx` has Home, Battle, Field Guide, Settings; Field Guide already presents descriptions but has no collection or team management.

**Proposed domain shapes (contract sketch, not premature code):**
- `ModelDexEntry`: stable `modelId`, availability/unlock state, factual `source` and `verifiedAt`, flavor/role and gameplay-only `balance` object; all derived from the model catalog and saved progress rather than duplicated mutable copies.
- `TeamLoadout`: `slots: [modelId, modelId, modelId]` (or fewer when unlocks limited); no duplicates in active team by default; validate all references on load.
- `MasteryRecord`: `modelId`, categorized experience/discoveries, and dated but device-local milestones recorded from **actual** completed battle events. Avoid grinding one action indefinitely to fabricate mastery.
- `Progress` schema version 2 with migration from `pokaimon:progress:v1`; preserve all valid previously cleared encounter IDs, and do not overwrite preferences stored under their separate key.

Keep Phase 1 engine a pure rules layer. UI gets model definitions through a shared accessor; adding a new model in Phase 5 should not require editing ModelDex JSX.

## Serial implementation slices

### 2A. ModelDex as a real reference book

Build a mobile-first roster list and detail view with searchable/filterable capabilities only if needed for three models; for three, simple category tabs and clear scrolling are enough. Show official documentation link, provider, release/version claim if verified, simulated role, equipped move technique descriptions, and discovery marker from actual events. Distinguish `supported by documented evidence` from `game-mechanic only`.

**Files:** `src/App.tsx`/new `src/game/ModelDex.tsx`, `src/content/core.ts` plus validation helpers, existing `PixelPortrait.tsx`, unit and Playwright tests.

**Tests:** every listed model has stable ID, source, portrait or deliberate fallback, four resolvable moves; clicking a model works without network; keyboard/phone navigation and returning to battle preserve app state. Invalid source metadata is clearly handled.

### 2B. Create a squad

Add **Team** editor reachable from home and ModelDex. Select/order up to three unique unlocked models. Start a battle with saved team and choose an active member, while Phase 1 switching only offers available teammates. On first migration default to the current three models; do not reduce existing playability.

**Tests:** selected team survives reload, invalid/duplicate IDs normalize safely, switch list respects chosen team, unsaved UI changes cannot softlock a battle, each valid team has a viable encounter route or communicates when no team member can finish a stage. A "restore starters" action is an escape hatch.

### 2C. Discovery and mastery

Track real actions from `BattleEvent`, not arbitrary screen visits. Examples: first successful research move, use verification after a source-conflict warning, first deliberate model switch, complete a battle with no wasted AP. Show discovered techniques and an encouraging, concise result-screen unlock notice. Mastery can increment on *meaningful completion* and should be bounded per battle or per scenario.

**Tests:** retrying/refreshing the same result does not duplicate rewards; losses can reveal knowledge but cannot grant win-only medals; completing battle twice has stable deduped achievements. Hard mode still gets truthful end-of-battle learning feedback.

### 2D. Unlock something tangible

Add **one new playable choice**: an alternate move loadout, original sprite palette variant or one already-sourced model entry. For scope safety prefer alternate loadouts with existing moves first; any truly new model must satisfy Phase 5 provenance safeguards early. Distinguish aesthetics, mastery and power; no loot boxes or paid items.

**Tests:** unlocking is achievable through documented play, changes selectable options, persists locally, is reversible/resettable via explicit user choice, and does not invalidate other battles. Run a full unlock path in Playwright.

### 2E. Migration, clarity and QA

Implement an idempotent old-to-new migration: read old `v1`, validate IDs, preserve `cleared`, create `v2`, migrate once, and tolerate storage denial or invalid JSON. Avoid reimporting deleted old rewards after explicit reset. Future formats should preserve unknown-but-valid versioned content IDs where sensible, with safe fallback for retired models.

**Tests:** fresh user, legacy save, malformed save, retired model ID, partially unlocked roster, reload, retry, reset. Check screen-reader announcements and mobile scroll targets. Ensure no movement to a cloud account is required.

## Exit gate and exclusions

**Done when:** player changes squad, starts a real Phase 1 battle, earns a discoverable mastery reward, opens ModelDex, reloads, and sees correct persistent state. All old completed encounters survive migration; current game remains playable. Provide CI, 360×800/390×844/desktop screenshots and one real saved-state round trip in [TASKS.md](TASKS.md).

**Not now:** procedural model imports, unreviewed benchmarks, trading, gacha, online inventory, cloud sync, skill trees, or claiming collectible rarity reflects provider intelligence. Those would add complexity before the campaign makes squad-building valuable.
