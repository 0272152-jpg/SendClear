import { isValidPassword, isValidPin } from './ledger.js';

// Seed script: invented test users and transfers. No real people, accounts or money.
//
// All four test accounts get the demo password and PIN from environment variables,
// so credentials never live in the repository. They go in the Blackboard submission
// instead. Ana and Beto are the main demo accounts; Carla and Diego can sign in too
// (D23), and Carla -> Diego proves one user cannot see another user's data.
// If the .env values are missing or invalid, only Carla and Diego are created, with
// random secrets, so nobody can sign in with a guessable password.

export const DEMO_USERS = [
  { name: 'Ana Demo', phone: '5550000001' },
  { name: 'Beto Demo', phone: '5550000002' },
];

export const EXTRA_USERS = [
  { name: 'Carla Prueba', phone: '5550000003' },
  { name: 'Diego Prueba', phone: '5550000004' },
];

// Explains why the demo accounts cannot be created, or returns null if the creds are fine.
export function demoCredsProblem(creds) {
  if (!creds || (!creds.password && !creds.pin)) return 'Demo accounts are off: no .env values. Create an account instead.';
  if (!isValidPassword(creds.password)) return 'Demo accounts are off: EXPO_PUBLIC_DEMO_PASSWORD needs 8+ characters.';
  if (!isValidPin(creds.pin)) return 'Demo accounts are off: EXPO_PUBLIC_DEMO_PIN must be 4 digits.';
  return null;
}

// Extra presenter account (name, phone, password, pin all from .env). Unlike seed(),
// it also runs on phones that already have data, so it appears after an update.
// Missing or invalid values, or a phone that already has an account, do nothing.
export async function ensureExtraAccount(ledger, account) {
  if (!account || !account.name || !account.phone) return false;
  if (!isValidPassword(account.password) || !isValidPin(account.pin)) return false;
  try {
    await ledger.signUp(account);
    return true;
  } catch (e) {
    if (e && e.code === 'PHONE_TAKEN') return false;
    throw e;
  }
}

// creds = { password, pin } for the demo accounts. Invalid or missing creds skip
// only the demo accounts; the other invented users are still created.
export async function seed(ledger, creds, randomSecret) {
  if (await ledger.hasUsers()) return false;

  const sessions = {};
  const pins = {};

  const credsOk = !demoCredsProblem(creds);
  if (credsOk) {
    for (const u of DEMO_USERS) {
      sessions[u.phone] = await ledger.signUp({ ...u, password: creds.password, pin: creds.pin });
      pins[u.phone] = creds.pin;
    }
  }
  for (const u of EXTRA_USERS) {
    const pin = credsOk ? creds.pin : String(Math.floor(1000 + Math.random() * 9000));
    const password = credsOk ? creds.password : randomSecret();
    sessions[u.phone] = await ledger.signUp({ ...u, password, pin });
    pins[u.phone] = pin;
  }

  const transfer = (from, to, amount, note) =>
    sessions[from] && sessions[to]
      ? ledger.send(sessions[from], { toPhone: to, amount, note, pin: pins[from] })
      : null;

  await transfer('5550000001', '5550000003', 25000, 'Tacos on Friday');
  await transfer('5550000002', '5550000001', 12000, 'Uber share');
  await transfer('5550000003', '5550000004', 40000, 'Concert tickets'); // Ana must never see this one
  return true;
}
