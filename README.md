# SendClear

**Vertical:** Payments · **One line:** send money to anyone in Mexico using only their phone number, with the fee shown before you confirm.

SendClear is a peer-to-peer (P2P) transfer app built with Expo (React Native) for the FIN506 Fintech final project. It runs in **Expo Go**. All data stays on the phone and is **invented**. No real money, accounts or people are involved.

## Final-project deliverables

The deck (PDF) and the financial model (Excel) are submitted on Blackboard, not kept in this repository. This repository holds the app and its build record (SPEC, DECISIONS, BITACORA).

## Run it

You need **Node.js 22 or newer** (`npm test` relies on it) and the **Expo Go** app on your phone (App Store / Google Play).

```bash
git clone <this repo>
cd sendclear
npm install
cp .env.example .env      # then fill in the demo password and PIN (from the Blackboard submission)
npx expo start            # add --tunnel if the phone is not on the same Wi-Fi
```

Scan the QR code with the camera (iPhone) or with Expo Go (Android).

### Let the professor open it without you (TODO-verify)

`npx expo start` only works while your computer is on and running it. To give the professor a link that keeps working until the course ends, publish the app with EAS Update (free Expo account):

```bash
npx eas-cli@latest login
npx eas-cli@latest update:configure
npx eas-cli@latest update --branch main --message "Final project"
```

Then share the update's QR code or link from expo.dev in the Blackboard submission. *TODO-verify: confirm on a second phone that Expo Go opens the published update.* Create `.env` before running `update`: the demo credentials are embedded when the app is published.

### Test accounts

On first launch, the app runs the seed script (`src/core/seed.js`) and creates invented users:

| User | Phone | Can sign in? |
|---|---|---|
| Ana Demo | 5550000001 | Yes, with the password/PIN from `.env` |
| Beto Demo | 5550000002 | Yes, with the password/PIN from `.env` |
| Carla Prueba | 5550000003 | Yes, same password/PIN from `.env` (random secret if `.env` is missing) |
| Diego Prueba | 5550000004 | Yes, same password/PIN from `.env` (random secret if `.env` is missing) |
| Presenter (optional) | from `.env` (`EXPO_PUBLIC_EXTRA_*`) | Yes. Created on every launch if missing, even on phones that already have data |

**The password and PIN are not in this repository.** They go in the Blackboard submission. You can also tap **Create account** to make your own test account, which starts with MXN 10,000.00 of demo money.

To start over, tap **Reset demo data** on the sign-in screen. If the `.env` values are missing or invalid, the sign-in screen says so, and Carla and Diego are still created.

### Tests (includes the cross-user test)

```bash
npm test
```

`test/ledger.test.mjs` checks the core flow, fees, PIN lockout, and that **one user can never see another user's transfers, balance or secrets** (the tests marked `CROSS-USER`).

## What is simulated

Everything simulated is labelled on screen with a gold **SIMULATED** badge.

| Real-world piece | In SendClear |
|---|---|
| Money / balances | Demo balance stored on the phone. New accounts get MXN 10,000.00 |
| SPEI transfer through a licensed partner | Ledger update on the phone (`src/core/ledger.js`). The receipt says "not a real SPEI payment" |
| Identity check (KYC) | Not run. Sign-up asks for name and phone only |
| Fee collection | Calculated and deducted from the demo balance (1%, max MXN 15) |
| Server / database | AsyncStorage on the device (see DECISIONS.md D2) |

## Security minimum

- **Sign-in** with phone and password. The phone remembers who is signed in (only the user id and the wrong-PIN count, never the password or PIN), so reopening the app skips sign-in. **Sign out**, 3 wrong PINs or **Reset demo data** forget it (DECISIONS.md D21).
- **Each user sees only their own data.** Every read in `ledger.js` takes the session and filters by `userId`. A transfer between two other people returns "not found". This is proven by the `CROSS-USER` tests.
- Passwords and PINs are stored as **salted SHA-256 hashes**, never in plain text.
- A **PIN is required** for every transfer. After 3 wrong PINs, the user is signed out.
- **No keys in the repo**: demo credentials come from `.env`, which is git-ignored.
- **No personal data in URLs or logs**: the app has no URLs with user data and makes no `console.log` calls.

## Project layout

```
App.js                  navigation + session
src/core/ledger.js      business rules (no Expo imports; tested in Node)
src/core/seed.js        invented test data
src/services.js         connects the ledger to AsyncStorage + expo-crypto
src/screens/*           SignIn, SignUp, Home, Send, Confirm, Receipt, History
src/components/ui.js    buttons, inputs, SIMULATED badge, transaction row
src/theme.js            navy + gold palette, money/date formatting
test/ledger.test.mjs    node:test suite
```
