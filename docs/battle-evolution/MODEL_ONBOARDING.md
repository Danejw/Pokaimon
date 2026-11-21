# Adding new AI models to Pokaimon

**Status:** Phase 5 registry foundation. The three historical game characters remain playable. Their preexisting links and dates are retained as **unreviewed references**, not confirmed capability evidence. The pipeline NEVER makes model calls or publishes candidates automatically.

## 1. Create a review-only candidate

Prepare a local UTF-8 JSON manifest containing a stable game ID, provider, documented model name/version, a specific HTTPS official documentation/release URL, and the date the reference was recorded:

```json
{
  "id": "example-model",
  "provider": "Example Provider",
  "displayName": "Example Model",
  "version": "1",
  "sourceUrl": "https://example.org/model-release",
  "recordedAt": "2026-11-20"
}
```

This example is **fictional** and must not be published. Run:

```bash
node scripts/prepare-model-candidate.mjs manifest.json > candidate.json
```

The script performs offline syntactic validation and emits a `publicationStatus: "candidate"` record with **no verified capabilities, moves, or balance scores**. It makes no network requests, does not change the game, and does not write repository files itself. Keep candidate records out of `MODEL_CATALOG` until reviewed. A failed script exits nonzero and produces no JSON candidate.

## 2. Review factual claims

Confirm model identity, release/version, evidence URL and availability from an official provider document **at the time of approval**. Record capability-by-capability support with dated URLs and notes; unknown features remain unknown. A reference URL alone does not prove the feature exists. Do not infer tool support, API names, performance rankings, pricing, context limits or model reliability from unverified descriptions.

For any spec that materially changes over time, the new model's review should include the date checked and a source excerpt/summary in its PR. If reviews cannot be completed, leave the candidate unpublished and explain the blocker.

## 3. Make a reviewed game profile

In `src/content/modelCatalog.ts`, enter a **reviewed** `ModelCatalogEntry` using the verified facts, explicitly fictionally balanced focus/tempo/precision, four existing move IDs and a palette. Do not map a game's move availability to a claimed native provider feature unless evidence supports that mapping. Move powers remain in the common `src/content/core.ts` move registry; the app simulates workflows rather than invoking providers.

`catalogToModels` includes only entries marked `approved`. Entries marked `candidate` or `retired` remain outside battles. Adding a new approved record uses the existing catalog adapter, ModelDex, squad selection, battle reducer and original generic portrait fallback. Per-model UI/sprite switches are not necessary; unique art can follow later.

## 4. Gate and publish

Before merging an approved entry, run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:agui`, `npm run build`, and `npm run test:e2e`. Verify roster IDs, move references, three-slot team save/migration, original fallback portrait in both ModelDex and combat stage, battle win/loss for the new squad, replay restoration and campaign/challenge reachability. Inspect mobile screenshots at 360×800, 390×844 and desktop. Ensure any saved loadout or replay for an older model remains meaningful, or show a clear migration failure message.

Publishing is a reviewed GitHub PR that changes static catalog data. Never auto-merge an unreviewed candidate or deploy it directly to production. Roll back with the PR revert and a catalog patch/version bump, preserving historical save IDs when practical.

## 5. Discovery automation later

First prove one complete reviewed real-model import from supplied official sources. Only then consider optional scheduled GitHub Actions discovery that **creates candidate review artifacts**, not published characters. It must have constrained sources, no paid APIs or credentials, rate limits, dedupe by official provider ID/version, and a human gate. If sourcing is unreliable, run the current offline script manually.

**This is not a claim that a newly released model has already been verified or added.**
