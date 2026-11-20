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

**Follow-up correction:** `BattlePanel.tsx` now reveals the final victory line immediately and uses a compact result-stage message; the longer lesson stays in the result section. Playwright asserts the complete victory title and maximum dialogue box height. **Revised screenshot and CI on latest head still need rechecking.** Never call the correction verified until the latest run passes and new screenshots are examined.

## What to inspect next
- Latest branch CI, preview Pages status, and `tactical-win-chromium-mobile.png` after the result-dialogue correction.
- Does the command layout fit 360×800 and 390×844 without scrolling? Does the win screen feel rewarding without duplicate paragraphs?
- Add a meaningful next vertical slice, not decorative complexity. Candidate: a concise first-battle interactive tutorial, or optional mastery challenge with a clear goal, grounded in screenshot/playtest evidence.
- Avoid adding fictitious model rankings, real-provider integrations, paid APIs, login, or sprawling extra screens.
- Keep this log evidence-first and link actual CI runs and screenshots. Update PR #3 as appropriate; leave it draft.
