// Run with: npm test
// Uses an in-memory store and Node's crypto instead of AsyncStorage / expo-crypto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createLedger, calcFee } from '../src/core/ledger.js';
import { demoCredsProblem, seed } from '../src/core/seed.js';

function memoryLedger() {
  const store = new Map();
  return createLedger({
    storage: {
      getItem: async (k) => (store.has(k) ? store.get(k) : null),
      setItem: async (k, v) => void store.set(k, v),
      removeItem: async (k) => void store.delete(k),
    },
    hash: async (t) => createHash('sha256').update(t).digest('hex'),
    newId: randomUUID,
  });
}

const PW = randomUUID(); // generated per run: no credentials in the repository
const PIN = '4821';

async function setup() {
  const ledger = memoryLedger();
  const ana = await ledger.signUp({ name: 'Ana Test', phone: '5551110001', password: PW, pin: PIN });
  const beto = await ledger.signUp({ name: 'Beto Test', phone: '5551110002', password: PW, pin: PIN });
  const carla = await ledger.signUp({ name: 'Carla Test', phone: '5551110003', password: PW, pin: PIN });
  return { ledger, ana, beto, carla };
}

test('core flow: sign in, send with PIN, balances and receipt', async () => {
  const { ledger } = await setup();
  const ana = await ledger.signIn({ phone: '5551110001', password: PW });
  const beto = await ledger.signIn({ phone: '5551110002', password: PW });

  const tx = await ledger.send(ana, { toPhone: '5551110002', amount: 50000, note: 'Rent', pin: PIN });
  assert.equal(tx.fee, calcFee(50000));
  assert.equal(tx.fee, 500); // 1% of MXN 500
  assert.match(tx.folio, /^SC-[0-9A-F]{8}$/);

  assert.equal((await ledger.getMe(ana)).balance, 100000 - 50000 - 500);
  assert.equal((await ledger.getMe(beto)).balance, 100000 + 50000);

  const betoView = await ledger.getTransaction(beto, tx.id);
  assert.equal(betoView.direction, 'received');
  assert.equal(betoView.fee, 0, 'recipient does not see the sender fee');
});

test('fee is capped at MXN 15', () => {
  assert.equal(calcFee(1000000), 1500);
});

test('CROSS-USER: a user cannot list or open transfers between two other users', async () => {
  const { ledger, ana, beto, carla } = await setup();
  const betoToCarla = await ledger.send(beto, { toPhone: '5551110003', amount: 10000, pin: PIN });

  const anaList = await ledger.listTransactions(ana);
  assert.equal(anaList.length, 0, 'Ana sees none of Beto and Carla transfers');

  await assert.rejects(ledger.getTransaction(ana, betoToCarla.id), { code: 'NOT_FOUND' });

  assert.equal((await ledger.listTransactions(beto)).length, 1);
  assert.equal((await ledger.listTransactions(carla)).length, 1);
});

test('CROSS-USER: recipient lookup reveals name and masked phone only, never balance or hashes', async () => {
  const { ledger, ana } = await setup();
  const found = await ledger.findRecipient(ana, '5551110002');
  assert.deepEqual(Object.keys(found).sort(), ['id', 'name', 'phoneMasked']);
  assert.equal(found.phoneMasked, '••• ••• 0002');
});

test('CROSS-USER: getMe returns only the signed-in user, never secrets', async () => {
  const { ledger, ana } = await setup();
  const me = await ledger.getMe(ana);
  assert.equal(me.phone, '5551110001');
  assert.equal(me.passwordHash, undefined);
  assert.equal(me.pinHash, undefined);
});

test('no session, no data', async () => {
  const { ledger } = await setup();
  await assert.rejects(ledger.listTransactions(null), { code: 'NO_SESSION' });
  await assert.rejects(ledger.listTransactions({ userId: 'forged-id' }), { code: 'NO_SESSION' });
});

test('wrong password and unknown phone give the same error', async () => {
  const { ledger } = await setup();
  await assert.rejects(ledger.signIn({ phone: '5551110001', password: 'nope-nope' }), { code: 'BAD_LOGIN' });
  await assert.rejects(ledger.signIn({ phone: '5559999999', password: PW }), { code: 'BAD_LOGIN' });
});

test('wrong PIN moves no money and locks after 3 tries', async () => {
  const { ledger, ana } = await setup();
  await assert.rejects(ledger.send(ana, { toPhone: '5551110002', amount: 100, pin: '0000' }), { code: 'BAD_PIN' });
  await assert.rejects(ledger.send(ana, { toPhone: '5551110002', amount: 100, pin: '0000' }), { code: 'BAD_PIN' });
  await assert.rejects(ledger.send(ana, { toPhone: '5551110002', amount: 100, pin: '0000' }), { code: 'PIN_LOCKED' });
  await assert.rejects(ledger.send(ana, { toPhone: '5551110002', amount: 100, pin: PIN }), { code: 'PIN_LOCKED' });
  assert.equal((await ledger.getMe(ana)).balance, 100000);
});

test('rejects overdraft, zero, self-transfer and unknown recipient', async () => {
  const { ledger, ana } = await setup();
  await assert.rejects(ledger.send(ana, { toPhone: '5551110002', amount: 100000, pin: PIN }), { code: 'NO_FUNDS' });
  await assert.rejects(ledger.send(ana, { toPhone: '5551110002', amount: 0, pin: PIN }), { code: 'BAD_AMOUNT' });
  await assert.rejects(ledger.send(ana, { toPhone: '5551110001', amount: 100, pin: PIN }), { code: 'SELF' });
  await assert.rejects(ledger.send(ana, { toPhone: '5550000000', amount: 100, pin: PIN }), { code: 'NOT_FOUND' });
});

test('seed creates invented users and Ana never sees Carla -> Diego', async () => {
  const ledger = memoryLedger();
  await seed(ledger, { password: PW, pin: PIN }, randomUUID);
  const ana = await ledger.signIn({ phone: '5550000001', password: PW });
  const list = await ledger.listTransactions(ana);
  assert.equal(list.length, 2);
  assert.ok(list.every((t) => t.counterpartyName !== 'Diego Prueba'));
  assert.equal(await seed(ledger, { password: PW, pin: PIN }, randomUUID), false, 'seed runs only once');
});

test('two overlapping sends both debit the balance (no lost update)', async () => {
  const { ledger, ana } = await setup();
  const [a, b] = await Promise.all([
    ledger.send(ana, { toPhone: '5551110002', amount: 10000, pin: PIN }),
    ledger.send(ana, { toPhone: '5551110003', amount: 10000, pin: PIN }),
  ]);
  assert.notEqual(a.id, b.id);
  assert.equal((await ledger.getMe(ana)).balance, 100000 - 2 * (10000 + 100));
  assert.equal((await ledger.listTransactions(ana)).length, 2);
});

test('quote validates like send but moves no money', async () => {
  const { ledger, ana } = await setup();
  const q = await ledger.quote(ana, { toPhone: '5551110002', amount: 20000 });
  assert.deepEqual(Object.keys(q.recipient).sort(), ['id', 'name', 'phoneMasked']);
  assert.equal(q.fee, 200);
  assert.equal(q.total, 20200);
  await assert.rejects(ledger.quote(ana, { toPhone: '5551110002', amount: 100000 }), { code: 'NO_FUNDS' });
  await assert.rejects(ledger.quote(ana, { toPhone: '5551110002', amount: 1000001 }), { code: 'TOO_BIG' });
  assert.equal((await ledger.getMe(ana)).balance, 100000);
});

test('bad .env demo creds skip only the demo accounts and explain why', async () => {
  assert.match(demoCredsProblem({ password: 'short', pin: '1234' }), /8\+ characters/);
  assert.match(demoCredsProblem({ password: 'long-enough', pin: '12345' }), /4 digits/);
  assert.match(demoCredsProblem({}), /no \.env/);
  assert.equal(demoCredsProblem({ password: 'long-enough', pin: '1234' }), null);

  const ledger = memoryLedger();
  await seed(ledger, { password: 'short', pin: '1234' }, randomUUID);
  assert.equal(await ledger.hasUsers(), true, 'Carla and Diego are still created');
  await assert.rejects(ledger.signIn({ phone: '5550000001', password: 'short' }), { code: 'BAD_LOGIN' });
});
