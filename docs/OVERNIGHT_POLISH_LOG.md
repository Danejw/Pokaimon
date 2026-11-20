# Pokaimon Overnight Game Lab

**Disposable branch:** `feat/overnight-gameplay-polish` from production merge `6d782ad97ee6d4eae97c6f5aac78a6d6cfd599a4`.  
**Draft PR:** https://github.com/Danejw/Pokaimon/pull/3  
**Safe preview:** https://danejw.github.io/Pokaimon/next/  
**Production:** https://danejw.github.io/Pokaimon/ (must remain code from main)

## Mandate
Build the most satisfying, legible, original, mobile-first Pokémon-like AI capability battle game possible. Choose user-visible vertical slices, avoid unnecessary dependencies or paid calls, keep battle rules deterministic and provider-agnostic, and show evidence for each claimed improvement. Never merge into main without user instruction. Every future run must inspect GitHub HEAD, CI, screenshots, last work and failure reports before choosing what to change.

## Pass 1: Battle tactics and clear rewards (started Nov 20, 03:30 HST)

**Code inspected:** `src/game/BattlePanel.tsx`, `src/battle/engine.ts`, `src/battle/types.ts`, `src/content/core.ts`, `src/game/BattleStage.tsx`, `src/style.css`, `tests/battle.test.ts`, `tests/e2e/visual.spec.ts`. Existing battle is three deterministic capability stages with six AP and a turn-two task counter. Users previously saw move names but couldn't see directly whether the current step accepts them.

**Implemented:** `src/battle/tactics.ts` pure read-only forecasting, step number, category fit and capped progress estimates; move badges show real matches and numerical simulated gain; counter telegraph appears at turn one; 4-turn efficient wins earn TACTICAL CLEAR. Button labels and accessible keyboard control unchanged. `tests/tactics.test.ts` and a full Playwright TASK victory flow check forecasts against the reducer and screen.

**First verified evidence:** Initial full PR CI run https://github.com/Danejw/Pokaimon/actions/runs/44745246813 passed lint, typecheck, unit tests, AG-UI, build and Playwright for mobile and desktop. Isolated Pages action https://github.com/Danejw/Pokaimon/actions/runs/44745300809 successfully built production from main and experiment at /next/, preserving the root. The very first preview action failed because the protected Pages environment was tied to main; the subsequent successful workflow no longer uses that environment gate.

**Actual screenshot inspection:** Downloaded the CI `pokaimon-pixel-ui-screenshots` artifact from run 44745246813 and opened `tactics-chromium-mobile.png` and `tactical-win-chromium-mobile.png`. The move-match badges (+36 vs ×) are visible, aligned and legible within the two-column move menu. The stage label and forewarning are visible. The initial win screenshot exposed a **real visual flaw**: result dialogue repeated an entire long move lesson, expanded excessively and showed only the first characters of the typewriter victory headline during capture.

**Verified follow-up correction:** `BattlePanel.tsx` now reveals the final victory line immediately and uses a compact result-stage message; the longer lesson stays in the result section. Playwright asserts the complete victory title and maximum dialogue box height. The complete feature CI on head `f893592b` **passed**: https://github.com/Danejw/Pokaimon/actions/runs/44745886367 . Downloaded that run's screenshot artifact and opened `tactical-win-chromium-mobile.png`; saw full `TASK completed!`, concise two-line guidance, no repeated wall of text, readable medal, unobstructed battlefield, and two clear next-action buttons. This is an inspected, visibly improved result. The later docs-only head should still be validated independently.

## What to inspect next
- Latest branch CI and preview Pages status after any new commits. Check screenshot artifacts for every meaningful visual change.
- Does the command layout fit 360×800 and 390×844 without scrolling? Does the win screen feel rewarding without duplicate paragraphs?
- Add a meaningful next vertical slice, not decorative complexity. Candidate: a concise first-battle interactive tutorial, or optional mastery challenge with a clear goal, grounded in screenshot/playtest evidence.
- Avoid adding fictitious model rankings, real-provider integrations, paid APIs, login, or sprawling extra screens.
- Keep this log evidence-first and link actual CI runs and screenshots. Update PR #3 as appropriate; leave it draft.

## Pass 2: Readable move teaching at decision time (Nov 20, ~04:00 HST)

**Evidence and rationale:** Inspected the actual command JSX and move definitions. The only explanation of a move's technique was hidden in the HTML `title` tooltip, which is inaccessible on touch and hard to discover with a keyboard. All current moves cost exactly one AP, so an initial idea to test navigation among unaffordable moves was invalid; that test was replaced before shipping. This is a focused, evidence-based educational UX improvement, not a new gameplay system.

**Changed:** `src/game/BattlePanel.tsx` shows the currently selected move's plain-language description and its actual forecasted stage fit, with a live status region. `src/style.css` styles the compact explanation; `tests/e2e/visual.spec.ts` checks that focus updates the guidance without executing a move. Kept the deterministic reducer, model definitions and stage calculations unchanged.

**Verification:** New test committed before implementation, and branch CI/preview Actions were triggered by commits. The final commit still needs its own complete CI result and screenshot inspection. Do not treat earlier passing runs as evidence for this change. Check the 390x844 and 360x800 command screenshots for overflow from the extra line. If it overflows, shrink or replace the existing tactical help line rather than removing the educational description. Preview should be considered unverified until the latest Pages run succeeds.

**Next:** Review latest CI and screenshots. If the lesson is cramped, combine it with the existing tactical help strip, then rerun tests and screenshot checks. Keep PR #3 draft.

## Pass 3: Preview reliability and screenshot review (Nov 20, ~04:55 HST)

**Verified HEAD and review:** Started at `d0518ad`; PR #3 remains open and draft. The current branch CI https://github.com/Danejw/Pokaimon/actions/runs/44749897126 passed. Downloaded screenshot artifact `14634084564` from that exact run and visually inspected `tactics-chromium-mobile.png` and `tactics-chromium-desktop.png`. The new selected-move explanation is legible on both; the four move cards and battlefield are unobstructed. The mobile screenshot shows space below the move guidance rather than the feared clipped menu. Also inspected the screenshot artifact's 14-file inventory, which includes mobile/desktop victory and selection states. No unsupported claim of a new physical-device test.

**Actual blocker:** Preview action https://github.com/Danejw/Pokaimon/actions/runs/44749887777 failed after both builds, all verification steps, and upload succeeded. Read the actual failed job log: `actions/deploy-pages@v4` reported `Found 0 artifact(s)` immediately after `upload-pages-artifact` successfully uploaded artifact `14635195862`. This is an artifact metadata visibility race, not a compile or gameplay failure. Requested a rerun of the failed preview job. On the experimental branch only, committed `1bc3e4f` adding a 15-second metadata propagation wait before deployment. This is a small reversible CI reliability fix; root is still built from main and /next from the experiment. It does not alter game rules or production source.

**Next evidence gate:** Check new Pages action for `1bc3e4f` and its deployment logs; don't claim latest preview live until success. If metadata lookup still fails, investigate retry behavior rather than increasing delay blindly. The subsequent gameplay slice can add an optional first-battle teaching moment once preview is reliably available.

## Pass 4: Enemy counter readability (Nov 20, ~06:00 HST)

**Evidence before change:** Inspected HEAD `a05af50`, open draft PR #3, and latest successful CI https://github.com/Danejw/Pokaimon/actions/runs/44758374498 and successful isolated preview https://github.com/Danejw/Pokaimon/actions/runs/44758363838 . Downloaded CI screenshot artifact `14640116456` and visually opened `tactics-chromium-mobile.png` and `tactics-chromium-desktop.png`. On both, model sprites, two-column move forecasts, lesson and battlefield are readable; there is space below the controls. Found that the enemy's turn-two `ENEMY_ACTED` event is only buried in the typewriter narration and log, so the opponent's action and changed verification requirement are easy to miss at the next decision.

**Slice:** Added a Playwright regression test first (`8ec49b7`), then a small `wild-counter` banner sourced directly from the deterministic reducer's `ENEMY_ACTED` event (`5cb928e`) and compact retro styling (`aaead1a`). It appears only on the turn when a real `used` counter event exists, then disappears on the following turn. No battle math, API, model ranking, or production main changes. The test asserts it is absent before the counter, displays the actual TASK Scope Shift message and required extra verification afterward, and disappears after the next move.

**Verification pending:** The prior screenshots and CI apply to `a05af50`, NOT to this new feature. New branch CI and Pages runs were triggered; their final outcome and new mobile/desktop screenshots must be inspected before marking this slice verified. In particular, inspect 390×844 and 360×800 command layout when the banner is present. If the added banner causes overflow, compress the redundant tactical-help text while retaining the lesson and counter. Keep PR #3 draft and preserve production root from main.

## Pass 5: Complete command narration (Nov 20, ~07:00 HST)

**Grounding:** Confirmed branch HEAD `cec32a7` before this slice, open draft PR #3, successful branch CI [44769100086](https://github.com/Danejw/Pokaimon/actions/runs/44769100086) and successful preview [44769082115](https://github.com/Danejw/Pokaimon/actions/runs/44769082115). Downloaded CI screenshot artifact `14646970862` and actually inspected `wild-counter-chromium-mobile.png` and `wild-counter-chromium-desktop.png`. The counter banner and forecasts were legible, but both screenshots showed the command dialogue frozen mid-sentence (`Apply a solu` / `Apply`) while move buttons were already active. This is confusing at decision time and makes screenshot captures look broken. Mobile screenshot is full-page and taller than the viewport; a viewport-height assertion after the counter remains worthwhile, separate from this small slice.

**One vertical slice:** Added Playwright regression test `decision prompt is complete when controls become actionable` first (commit `6151138`). Updated `BattlePanel.tsx` (commit `314adf6`) to reveal complete narration whenever `phase === 'command'`. Typewriter animation remains during cinematic encounter, throw, summon and attack; reduced-motion and fast-text behavior remain unchanged. This fixes the observed mid-sentence decision prompt without touching battle rules, assets or production main.

**Evidence gate:** The previous passing CI and preview only validate pre-change head `cec32a7`. Check new CI and Pages workflows for `314adf6` or later, inspect refreshed mobile/desktop `tactics` and `wild-counter` screenshots, and fix any regression. Do not claim this change verified or deployed until those runs pass. Next highest-value improvement: ensure the full command UI remains comfortably within a 360×800 phone viewport after the enemy counter, using measured DOM boxes and screenshots rather than guessing CSS.

## Pass 6: Compact counterattack decision screen (Nov 20, ~08:00 HST)

**Verified starting point:** Branch HEAD `704cf98`, PR #3 open/draft. Latest CI [44779173215](https://github.com/Danejw/Pokaimon/actions/runs/44779173215) and isolated preview [44779154368](https://github.com/Danejw/Pokaimon/actions/runs/44779154368) both passed for that exact head. Downloaded and opened CI screenshot artifact `14651111971`, specifically `wild-counter-chromium-mobile.png` and `wild-counter-chromium-desktop.png`. Both clearly show a large, repetitive multi-line move lesson in the main dialogue while the new move-lesson strip and counter banner already explain the same decision. The mobile full-page image is visibly taller than the portrait viewport, making the last command help line fall below the fold.

**One focused slice:** Added a Playwright regression test first (commit `9f01bb7`) for a 390×844 counterattack viewport, asserting no horizontal or vertical overflow and all tactical controls visible. Then shortened only the **command-phase** narration (commit `3044ae8`) to a one-sentence stage prompt, or a one-sentence actual counter announcement. The detailed lesson remains available in the battle log and contextual move teaching, while the explicit `wild-counter` banner continues to explain the reducer event. No rules, art, API, or production source changes.

**Verification pending:** Prior successful screenshots and CI validate only `704cf98`, not this new change. Await fresh CI and Pages runs for `3044ae8` or later. Inspect the new `counter-fit-chromium-mobile.png` screenshot and its desktop counterpart. If viewport assertion fails, adjust only redundant command chrome and rerun; do not claim success prematurely. The screenshot tests currently use 390×844; a 360×800 counter state is a follow-up device target. Leave PR draft and production main untouched.


## Pass 7: Player-controlled difficulty (Nov 20)

**Request:** Easy, Medium (default), Hard. Medium removes damage forecasts and advice on the correct move while retaining technique descriptions for learning. Hard hides technique descriptions and tactical predictions; Easy preserves the existing teaching UI.

**Grounding:** Started from draft PR #3 head `dc6fd61`. Existing preferences stored in `src/storage/preferences.ts`, settings in `src/App.tsx`, and forecasts/lessons in `src/game/BattlePanel.tsx`. Prior head's CI run [44788221775](https://github.com/Danejw/Pokaimon/actions/runs/44788221775) failed in Playwright, despite passing lint, types, unit and build. Do not treat the prior head as green.

**Changes:** Persisted validated difficulty with backward-compatible Medium fallback; added difficulty dropdown and short descriptions in Settings; passed preference to BattlePanel. Easy retains stage hints, forecast badges, matchup warnings and effectiveness text. Medium retains basic technique descriptions and factual battle stage labels but hides numerical forecasts, correct-answer hints and model matchup spoilers. Hard hides technique lessons, step hints and telegraphed warnings while keeping factual enemy counterattacks and outcome feedback. Battle reducer and damage rules unchanged. Added Playwright coverage for default, persistence, and all three levels; preexisting Easy-specific tactical tests now explicitly choose Easy.

**Verification gate:** Commits through `957381c` are awaiting CI and Pages verification. Screenshots from this new head have not yet been inspected. In particular, verify default Medium mobile/desktop command layout and Settings dropdown. Prior failure in the 390×844 viewport test may still exist. If CI fails, inspect logs and fix before claiming this release deployed. Existing draft PR remains open and production main unchanged.
