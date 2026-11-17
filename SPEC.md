# SPEC: SendClear

## User and problem
Young adults in Mexico who split costs with friends (rent, food, trips) and send small amounts by bank transfer. They have to ask for the full CLABE, they don't always know the fee up front, and they get no clear proof of payment to share. *(TODO-verify: not yet measured with users.)*

## Core flow (must work end to end)

1. **Sign in** with phone (10 digits) and password, or **create an account** (name, phone, password, 4-digit PIN). New accounts get MXN 10,000.00 of simulated demo money.
2. **Home** shows the balance, the user's SendClear number and the last 5 transfers.
3. **Send money**: type the recipient's phone. The app shows their name and masked phone (`••• ••• 0002`). Enter the amount and an optional note. Fee and total are shown live. Tap **Review transfer**: the ledger checks limit, recipient and balance before moving on.
4. **Review**: recipient, amount, fee (1%, max MXN 15.00) and total. Enter the 4-digit PIN and tap **Send**. A wrong PIN shakes the boxes and moves no money.
5. **Receipt** with folio (`SC-XXXXXXXX`), date, parties, amount, fee, total and status *Completed*. **Done** or going back returns to Home, never to the PIN screen, so a transfer cannot be sent twice.
6. **History**: every transfer sent or received. Tap one to open its receipt.
7. **Sign out** (button at the end of Home). Until then, reopening the app keeps you signed in on that phone.

## Rules
- Amounts are stored in centavos (integers).
- Fee = 1% of the amount, rounded, capped at MXN 15.00. The sender pays it. The recipient receives the full amount.
- Limit: MXN 10,000.00 per transfer. The amount must be above zero.
- Cannot send to yourself or to a phone without an account. Cannot send more than balance − fee.
- Wrong PIN: no money moves. After 3 wrong PINs the user is signed out. The count survives closing the app.
- A user sees only transfers where they are the sender or the recipient. Other users appear only as name + masked phone.
- The fee is shown only to the sender.

## Out of scope (scope frozen)
Real SPEI/bank rails, KYC, cash-in/cash-out, requests for money, QR codes, notifications, multi-device sync.

## Simulated, labelled on screen
Balances, the transfer itself (no SPEI), fee collection, identity check. See README.md.
