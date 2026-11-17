# BITÁCORA

| Date | Who | What | AI used? |
|---|---|---|---|
| 2026-11-16 | TODO (name) | Defined the product with the team: P2P transfers by phone number, English UI, navy + gold palette, local storage on the phone. Extras: history, receipt, PIN | AI coding assistant asked the questions |
| 2026-11-16 | TODO (name) | Created the Expo SDK 58 project and installed React Navigation, AsyncStorage, expo-crypto | AI coding assistant |
| 2026-11-16 | TODO (name) | Wrote `ledger.js` (accounts, PIN, fee, transfers, per-user filtering) and `seed.js` (invented users) | AI coding assistant, reviewed by us |
| 2026-11-16 | TODO (name) | Built the 7 screens and the SIMULATED badges | AI coding assistant, reviewed by us |
| 2026-11-16 | TODO (name) | Added `npm test`: 10 tests including the cross-user tests. All pass | AI coding assistant |
| 2026-11-16 | TODO (name) | Checked the Android bundle (`expo export`) and ran `expo-doctor`: 20/20 checks passed | AI coding assistant |
| 2026-11-16 | TODO (name) | Code review: fixed double-tap duplicate transfers, concurrent-write lost updates, silent seed failure on bad `.env`, stale recipient lookup, History hiding errors, hard-coded receipt status. Moved transfer rules into `ledger.quote()`, shared `Row`, storage cache. README now says Node 22+. 13 tests pass | AI code review, reviewed by us |
| 2026-11-16 | TODO (name) | Redesign following Apple's interface guidelines: type scale, press feedback with springs, PIN boxes with shake, haptics, Reduce Motion support, large titles, keyboard avoidance. Removed the Expo template LICENSE. Checked the app against the course rubric | AI coding assistant, reviewed by us |
| 2026-11-16 | TODO (name) | Built the deliverables in `entrega/`: Excel model (assumptions tab + formulas, recalculated in Excel), 19-slide deck in the app's navy + gold (PDF + PPTX, numbers read from the Excel), pitch script with Q&A, interview guide, regulatory/legal detail. Found the DiMo risk (Banxico Circulares 9 and 10/2026) and put it in the deck | AI coding assistant, reviewed by us |
| 2026-11-16 | Rafael Galicia Figeroa | Lighter deck for a single presenter: one idea and one gold focal number per slide, Gestalt layout (proximity, similarity, common region, continuity, figure-ground); details moved to the appendix. Pitch script rewritten for one speaker | AI coding assistant, reviewed by me |
| TODO | TODO | Run the real interviews and fill slide 2 and A3 | |
| TODO | TODO | Tested on a real phone with Expo Go (iPhone + Android) | |
| TODO | TODO | Partner review and merge through a pull request | |

## How we used AI
An AI coding assistant generated the first version of the code and the docs from our answers about the product. We reviewed each file and must be able to explain it. Before Demo Day, each of us should be able to: change the fee in `ledger.js` (`FEE_RATE`, `FEE_CAP`), change a color in `theme.js`, and explain how `listTransactions` filters by user.
