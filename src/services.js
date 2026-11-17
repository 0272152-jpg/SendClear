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
  await ledger.resetAll();
  await seedIfEmpty();
}
