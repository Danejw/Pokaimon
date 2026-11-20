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
