# Phase 5: Living Model Ecosystem

**State:** Planned, not implemented. **Requires:** stable Phase 1–4 battle, ModelDex, content versioning, scenario validation, fallback art and QA. **Exit:** a newly released AI model can be discovered as a candidate, reviewed and imported by data, and played in static Pokaimon without editing engine/reducer/JSX for each release.

## Player experience and promise

When a genuinely new model arrives, Pokaimon can propose a new creature profile with an original/fallback appearance and proposed move set. After reliable facts are checked, it enters the ModelDex and team roster, and can participate in existing battles. Players learn what is documented about it, where evidence is uncertain, and which powers are **game balance**. The roster can grow without a rewrite.

**Critical distinction:** "automatic" means **automate evidence gathering, candidate drafting, validation and integration mechanics**. It does **not** mean automatically claim unsupported capabilities or silently put an unreviewed model into production.

## Source of truth and data contract

Current model definitions live together in `src/content/core.ts` as the `MODELS` array with `id/provider/displayName/version/description/source/verifiedAt/moveIds/palette/focus/tempo/precision`. `getModel`, `movesFor` and `validateRoster` already provide simple reusable lookup/validation. `PixelPortrait` and some UI casts currently assume `astra/grok/fable`; these are known growth blockers. Core rules reference stable model IDs and must remain generic.

**Proposed format (schema sketch, not committed code):**

```ts
interface ModelCatalogEntry {
  schemaVersion: 1;
  id: string;                 // immutable stable game ID, not display name
  provider: string;
  modelName: string;
  providerModelId?: string;   // official API ID if verified, never guessed
  version: string;
  releaseDate?: string;       // only if sourced
  status: 'candidate' | 'verified' | 'retired';
  capabilities: Array<{
    kind: string;             // documented capability, not PvP strength
    support: 'confirmed' | 'unknown';
    evidenceUrls: string[];   // specific official links
    checkedAt: string;        // date validated
    notes?: string;
  }>;
  balanceProfileId: string;   // separate, expressly fictional stats
  moveIds: [string,string,string,string];
  portraitAssetId?: string;   // generic fallback when absent
}

interface BalanceProfile {
  id: string;
  patchVersion: string;       // game tuning, not a dated benchmark
  focus: number; tempo: number; precision: number;
  movePowerModifiers?: Record<string,number>;
}
```

Keep the actual first implementation smaller if these fields are not yet needed. Required invariant: factual metadata **cannot** be overwritten by a gameplay balance patch; game stats never masquerade as empirical benchmark scores. Record exact source and checked date for sourced claims; `unknown` must stay unknown. No provider credentials or hidden keys in the static app.

## Candidate import pipeline

```mermaid
flowchart LR
  A[Official provider release notes / model docs] --> B[Discover model ID + URLs]
  B --> C[Draft untrusted candidate JSON]
  C --> D[Evidence and schema checks]
  D --> E[Human review: provenance and gameplay balance]
  E --> F[Validate roster + solvability + original/fallback art]
  F --> G[Open PR + CI]
  G --> H[Approved merge publishes static catalog]
```

Only an **approved content merge** makes a model playable. Propose candidate files/PRs automatically only after a manual import proves reliable. A scheduled free GitHub Actions job is an optional follow-up; do not create unattended workflows that incur paid calls or automatically merge content. The candidate importer may run locally/offline on predownloaded official metadata when reliable fetching isn't available.

## Serial implementation slices

### 5A. Model evidence vs balance profiles

Refactor a single existing model definition into factual metadata + separate fictional balance, preserving `getModel`, `movesFor`, deterministic game state and all older model IDs. Retain data-driven semantics for three current models, do **not** rewrite reducer.

**Tests first:** display source/checked date correctly; balance patch changes fictional power only, not claimed supported features; metadata unknown is rendered as unknown; all three current loadouts still work.

### 5B. Validated registry and new portrait fallback

Make registry read generic model IDs. Add lightweight runtime/build-time validation: unique stable IDs, four resolvable moves, valid categories, sourced claims, bounded game numbers, acceptable URL scheme, supported status, safe sanitized text and optional original asset references. Add a **generic original fallback creature portrait** rather than keeping `as 'astra'|'grok'|'fable'` casts.

**Likely paths:** `src/content/core.ts` or `src/content/models/`, `src/battle/types.ts`, `src/game/PixelPortrait.tsx`, `src/App.tsx`, `src/game/BattlePanel.tsx`, `tests/roster.test.ts`, ModelDex tests. Split files only after more than a few definitions make it worthwhile.

**Tests:** unknown ID gracefully handled, malformed URLs/capabilities rejected, retired versions remain referentially safe for saves/replays, one dummy **fictional test entry** renders without a special-case component, three existing models unaffected.

### 5C. Discovery to **candidate**, never auto-publication

Build a small import command taking official provider docs/releases URLs or a local source manifest. Parse names and IDs conservatively. Output a review file with source text/snippets and retrieval date; missing metadata remains blank or unknown rather than guessed. Deduplicate against existing provider+official model ID and versions. Do not scrape user accounts or run paid AI models.

**Tests:** known release fixture drafts candidate, duplicate fixture produces no duplicate, incomplete entry remains candidate, adversarial/untrusted page text cannot modify files outside candidate directory, network failure preserves last valid catalog, empty scan does nothing.

### 5D. Human review and publication workflow

Reviewers decide factual support and fictional move/balance loadout separately. A generated PR (optional) contains candidate JSON + provenance; CI enforces validator, model-source links where feasible, battle solvability matrix, save/replay stability and screenshot smoke. **No automatic merger and no default Pages deploy from unreviewed candidates.**

For version updates, publish a new revision entry or stable alias with explicit migration instead of silently changing the identity of an old replay. Mark retired/deprecated models without deleting historical wins.

**Tests:** candidate never shown as playable, verified entry loads by configuration alone, rolling back content version restores previous catalog, no stale/source-less claim displayed, no API keys or billing required.

### 5E. Demonstration with one new, real, approved model

Choose a documented official model **at the time of implementation**, record exact evidence, map documented capabilities to gameplay techniques and create an original sprite or generic fallback. The final acceptance test must register it via data and run a full real **simulated game** win, loss, team switch, ModelDex inspection, campaign compatibility and replay, without editing battle math or per-model JSX.

**Tests:** registry schema acceptance, bounded and reachable matchups, all old tests still green, data-only import, mobile/desktop rendering, persisted team with new model reload, old save migration, automatic candidate review path. Clearly show "game balance" values and sourced real metadata.

## Operational constraints and exit gate

- A model name/version must not become playable solely from a rumor, search snippet, model-generated answer or marketing benchmark without source review.
- Sources should be specific provider documentation, release notes or independently documented results with dates. Any capabilities inferred from comparison benchmarks need explicit labeling; unsupported API availability never assumed.
- Data file generation can be automatic; validation and approval are mandatory. No arbitrary user-supplied scripts executed.
- Static GitHub Pages bundles a frozen verified registry snapshot, so it works without a backend. No client secrets, model calls, auth, billing or direct integration required. AG-UI remains a separate opt-in future surface, not a prerequisite.
- Zero provider API usage during discovery/import verification by default, unless user authorizes specific calls and budgets later.
- Require source freshness review before new model announcement and record what was checked.

**Done when:** reviewers can add one real sourced model through the candidate→approved registry flow, and it becomes playable with its original/fallback art in every existing feature without a per-model code branch. CI verifies schema, solvability, old saves and replay. Mark in [TASKS.md](TASKS.md) with an actual test run and screenshots.

**Not now:** automatic new-release publication, live inference, server databases, benchmark scraping without permission, autonomous model rankings, paid research, continuous public API polling or dynamic provider orchestration.
