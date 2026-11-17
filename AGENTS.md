# AGENTS.md: instructions for AI coding agents

SendClear is an Expo SDK 58 app (JavaScript) that must keep running in **Expo Go**.

## Rules
- **Scope is frozen.** Do not add features. Fix bugs in the core flow described in SPEC.md.
- Only use libraries bundled in Expo Go. Install with `npx expo install <pkg>`, never `npm install <pkg>`.
- Business rules live in `src/core/ledger.js`, which must not import Expo or React Native. It is tested by `npm test`.
- Every read of user data must take the session and filter by `userId`. Add a `CROSS-USER` test for any new read.
- Money is integer centavos.
- Anything simulated must show the `SimulatedBadge` on screen and be listed in README.md.
- Never commit credentials, keys or `.env`. Never log personal data.
- Mark any fact you could not confirm as **TODO-verify**.
- Update SPEC.md, DECISIONS.md and BITACORA.md with every change.

## Commands
```bash
npm test            # ledger tests
npx expo start      # dev server (add --tunnel off-network)
npx expo-doctor     # dependency check
```
Expo docs for this SDK: https://docs.expo.dev/versions/v58.0.0/
