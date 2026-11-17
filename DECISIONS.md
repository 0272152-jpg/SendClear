# DECISIONS

Each decision: what we chose, what we rejected, why.

## D1: Expo + Expo Go
**Chose:** Expo SDK 58 with JavaScript, run in Expo Go. **Rejected:** native builds, a web app.
**Why:** the professor and judges can open it on their phone with a QR code. No store submission and no Xcode/Android Studio needed. Every library we use (React Navigation, AsyncStorage, expo-crypto) ships inside Expo Go.

## D2: Local storage on the phone instead of a server
**Chose:** AsyncStorage on the device. **Rejected:** Supabase / Firebase.
**Why:** it is our team's decision for the demo: zero infrastructure, zero keys, and it works offline in the room.
**Trade-off:** users only exist on the phone where they were created, so two people on two phones cannot send to each other. A production version needs a server ledger behind a licensed partner. Per-user isolation is enforced in `ledger.js` (every read filters by the session's `userId`), not by the operating system. Anyone with physical access to an unlocked, rooted phone could read the raw storage. That is acceptable for invented data only.

## D3: Business rules in a pure module (`src/core/ledger.js`)
**Why:** the same code runs in the app and in `npm test` (Node). That is how we prove the cross-user rule without a phone. It is also the one file to open when the judges ask "where does the fee come from?".

## D4: Money in integer centavos
**Why:** `0.1 + 0.2 !== 0.3` in JavaScript. Integers avoid rounding errors in balances and fees.

## D5: Fee = 1% capped at MXN 15, paid by the sender
**Assumption**, to be checked against the Excel model. It is shown before confirming and on the receipt (transparency is the product's promise). The cap keeps large transfers competitive with free SPEI. *TODO-verify: the final fee must match the Excel model's ARPU.*

## D6: PIN on every transfer, lock after 3 wrong attempts
**Why:** a second factor on the action that moves money, separate from the sign-in password. The lockout counter lives in the session, so signing in again resets it.

## D7: Salted SHA-256 for password and PIN
**Chose:** SHA-256(salt + secret) via expo-crypto. **Rejected:** bcrypt/argon2 (not available in Expo Go without a native build).
**Trade-off:** a fast hash is weaker against brute force than bcrypt. That is fine for demo data. Production would hash on a server with argon2.

## D8: Demo credentials from `.env`, not from the repo
**Why:** the guidelines forbid credentials in the repository. `EXPO_PUBLIC_*` variables are embedded in the app bundle at build time, so they are visible to anyone with the bundle. That is acceptable only because they protect invented test accounts.

## D9: Same error for unknown phone and wrong password
**Why:** prevents checking which phone numbers have an account from the sign-in screen. (Recipient lookup does reveal whether a number exists. That is necessary to show the name before sending, and it only works for a signed-in user.)

## D10: React Navigation instead of Expo Router
**Why:** the app has 7 screens in one stack. An explicit navigator in `App.js` is easier for both of us to explain and change live than file-based routing.

## D11: Ledger operations run one at a time (code review fix)
Every ledger call goes through a promise queue (`exclusive` in `ledger.js`). The Confirm button also ignores a second tap while a transfer is in flight (`useRef`). Together they prevent duplicate transfers and lost balance updates. Covered by the "overlapping sends" test.

## D12: `quote()` is the only place the Send screen validates (code review fix)
Limit, recipient and balance checks live once, in `validateTransfer` in `ledger.js`, used by both `quote()` and `send()`. The screen only shows the ledger's answer.

## D13: In-memory cache of storage
`ledger.js` keeps the raw JSON in memory after the first read, because it is the only writer of those keys. Fewer AsyncStorage reads on every screen focus.

## D14: Design system based on Apple's interface guidelines
- **Feedback on touch-down:** buttons shrink to 97% the moment they are pressed (spring, no bounce), not when released.
- **Springs, not fixed animations:** stiffness and damping come from Apple's "response + damping ratio" (`springs` in `theme.js`). Damping ratio 1.0 everywhere: no bounce, because nothing in the app is thrown or flicked.
- **Type scale with size-specific tracking:** big numbers get negative letter-spacing and tabular figures so amounts line up; small labels get slightly positive tracking (`type` in `theme.js`). System font (San Francisco / Roboto).
- **Hierarchy:** the amount is the largest element on Send, Confirm and Receipt. The Send button sits inside the balance card (proximity).
- **PIN boxes** like the iPhone passcode screen. A wrong PIN shakes them, turns them red and fires an error haptic, all on the same frame.
- **Haptics only on meaningful moments:** transfer sent (success), wrong PIN or failed sign-in (error). `expo-haptics` ships in Expo Go.
- **Reduce Motion respected:** with the phone setting on, nothing scales, slides or shakes; elements only fade (`useReducedMotion` in `feedback.js`).
- **Wayfinding:** iOS large titles on Home ("Hi, Ana") and All transfers. After sending, the stack is reset to Home → Receipt, so going back can never return to the PIN screen and re-submit.
- Rejected: bouncy springs and confetti. A payment app should feel calm and certain, not playful.

## D15: Removed the Expo template's LICENSE file
`create-expo-app` copied a LICENSE naming 650 Industries (Expo) as copyright holder. The code is ours, so we removed it. **TODO-verify:** pick our own license (or "all rights reserved") in the founders' agreement. Our dependencies (Expo, React Native, React Navigation) are MIT-licensed, which allows commercial use with attribution.
