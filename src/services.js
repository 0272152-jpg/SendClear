// Wires the pure ledger to the phone: AsyncStorage for data, expo-crypto for hashing and IDs.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createLedger } from './core/ledger';
import { demoCredsProblem, ensureExtraAccount, seed } from './core/seed';

export const ledger = createLedger({
  storage: AsyncStorage,
  hash: (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text),
  newId: () => Crypto.randomUUID(),
});

// Values come from .env (not committed). See .env.example and README.md.
const demoCreds = {
  password: process.env.EXPO_PUBLIC_DEMO_PASSWORD,
  pin: process.env.EXPO_PUBLIC_DEMO_PIN,
};

// Shown on the sign-in screen so a bad .env is never a silent failure.
export const demoWarning = demoCredsProblem(demoCreds);

// Optional presenter account, also from .env.
const extraAccount = {
  name: process.env.EXPO_PUBLIC_EXTRA_NAME,
  phone: process.env.EXPO_PUBLIC_EXTRA_PHONE,
  password: process.env.EXPO_PUBLIC_EXTRA_PASSWORD,
  pin: process.env.EXPO_PUBLIC_EXTRA_PIN,
};

export async function seedIfEmpty() {
  const seeded = await seed(ledger, demoCreds, () => Crypto.randomUUID());
  await ensureExtraAccount(ledger, extraAccount);
  return seeded;
}

export async function resetDemoData() {
  await clearSession();
  await ledger.resetAll();
  await seedIfEmpty();
}

// Remembered sign-in (D21): only { userId, pinAttempts } is stored on the phone, never a password or PIN.
// The wrong-PIN count is stored too, so closing the app does not reset the 3-try limit.
const SESSION_KEY = 'sendclear.session.v1';

export async function saveSession(session) {
  if (!session) return;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ userId: session.userId, pinAttempts: session.pinAttempts || 0 }));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// Returns the saved session only if that user still exists on this phone; otherwise forgets it.
export async function restoreSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const session = { userId: String(saved.userId || ''), pinAttempts: Number(saved.pinAttempts) || 0 };
    await ledger.getMe(session); // throws if the account was deleted (e.g. Reset demo data)
    return session;
  } catch {
    await clearSession().catch(() => {});
    return null;
  }
}
