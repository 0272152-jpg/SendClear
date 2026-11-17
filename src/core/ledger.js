// SendClear ledger: all business rules live here.
// It does not import anything from Expo or React Native, so the same code runs
// in the app (with AsyncStorage + expo-crypto) and in Node tests (in memory).
//
// Money is always stored in integer centavos (MXN) to avoid float rounding.

export const DEMO_STARTING_BALANCE = 1000000; // MXN 10,000.00 of simulated funds per new account (assumption)
export const FEE_RATE = 0.01; // 1% of the amount sent (assumption, see DECISIONS.md)
export const FEE_CAP = 1500; // fee never above MXN 15.00 (assumption)
export const MAX_TRANSFER = 1000000; // MXN 10,000.00 per transfer (assumption)
export const MAX_PIN_ATTEMPTS = 3;

const USERS_KEY = 'sc:users';
const TXS_KEY = 'sc:txs';

export class LedgerError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function calcFee(amount) {
  return Math.min(Math.round(amount * FEE_RATE), FEE_CAP);
}

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function maskPhone(phone) {
  const p = normalizePhone(phone);
  return p.length >= 4 ? `••• ••• ${p.slice(-4)}` : '••••';
}

export function isValidPassword(password) {
  return String(password || '').length >= 8;
}

export function isValidPin(pin) {
  return /^\d{4}$/.test(String(pin || ''));
}

// deps = { storage: {getItem, setItem, removeItem}, hash: async (text) => hex, newId: () => string, now: () => Date }
export function createLedger(deps) {
  const { storage, hash, newId, now = () => new Date() } = deps;

  // One operation at a time. Without this, two overlapping transfers could each
  // read the same balance and the last save would erase the other's debit.
  let queue = Promise.resolve();
  function exclusive(fn) {
    const run = queue.then(() => fn());
    queue = run.catch(() => {});
    return run;
  }

  // Raw JSON cached in memory, so each call does not hit AsyncStorage again.
  // Safe because this ledger is the only writer of these keys.
  const cache = new Map();
  async function load(key) {
    if (!cache.has(key)) cache.set(key, await storage.getItem(key));
    const raw = cache.get(key);
    return raw ? JSON.parse(raw) : [];
  }
  async function save(key, value) {
    const raw = JSON.stringify(value);
    await storage.setItem(key, raw);
    cache.set(key, raw);
  }
  async function remove(key) {
    await storage.removeItem(key);
    cache.delete(key);
  }
  async function secret(salt, value) {
    return hash(`${salt}:${value}`);
  }

  function requireSession(session) {
    if (!session || !session.userId) throw new LedgerError('NO_SESSION', 'Please sign in again.');
  }

  async function currentUser(session) {
    requireSession(session);
    const users = await load(USERS_KEY);
    const me = users.find((u) => u.id === session.userId);
    if (!me) throw new LedgerError('NO_SESSION', 'Please sign in again.');
    return { users, me };
  }

  // What a signed-in user may see about themselves. Never includes hashes.
  function publicSelf(u) {
    return { id: u.id, name: u.name, phone: u.phone, balance: u.balance };
  }

  // What a user may see about someone else: name and masked phone only.
  function publicOther(u) {
    return { id: u.id, name: u.name, phoneMasked: maskPhone(u.phone) };
  }

  // A transaction as seen by one user. Only the parties of a transfer can read it.
  function viewTx(tx, userId) {
    const outgoing = tx.fromId === userId;
    return {
      id: tx.id,
      folio: tx.folio,
      createdAt: tx.createdAt,
      direction: outgoing ? 'sent' : 'received',
      counterpartyName: outgoing ? tx.toName : tx.fromName,
      fromName: tx.fromName,
      toName: tx.toName,
      amount: tx.amount,
      // The fee is only shown to the sender, who paid it.
      fee: outgoing ? tx.fee : 0,
      total: outgoing ? tx.amount + tx.fee : tx.amount,
      note: tx.note,
      status: tx.status,
      simulated: true,
    };
  }

  // The single place where transfer rules live. Used by quote() and send().
  function validateTransfer(users, me, toPhone, amount) {
    if (!Number.isInteger(amount) || amount <= 0) throw new LedgerError('BAD_AMOUNT', 'Enter an amount above zero.');
    if (amount > MAX_TRANSFER) throw new LedgerError('TOO_BIG', 'The limit per transfer is MXN 10,000.00.');
    const to = users.find((u) => u.phone === normalizePhone(toPhone));
    if (!to) throw new LedgerError('NOT_FOUND', 'No SendClear account with that number.');
    if (to.id === me.id) throw new LedgerError('SELF', 'You cannot send money to yourself.');
    const fee = calcFee(amount);
    if (me.balance < amount + fee) throw new LedgerError('NO_FUNDS', 'Not enough balance for amount plus fee.');
    return { to, fee };
  }

  return {
    signUp: ({ name, phone, password, pin }) =>
      exclusive(async () => {
        const cleanName = String(name || '').trim();
        const cleanPhone = normalizePhone(phone);
        if (cleanName.length < 2) throw new LedgerError('BAD_NAME', 'Enter your full name.');
        if (cleanPhone.length !== 10) throw new LedgerError('BAD_PHONE', 'Phone must have 10 digits.');
        if (!isValidPassword(password)) throw new LedgerError('BAD_PASSWORD', 'Password needs at least 8 characters.');
        if (!isValidPin(pin)) throw new LedgerError('BAD_PIN', 'PIN must be 4 digits.');

        const users = await load(USERS_KEY);
        if (users.some((u) => u.phone === cleanPhone)) {
          throw new LedgerError('PHONE_TAKEN', 'That phone number already has an account.');
        }
        const salt = newId();
        const user = {
          id: newId(),
          name: cleanName,
          phone: cleanPhone,
          salt,
          passwordHash: await secret(salt, password),
          pinHash: await secret(salt, `pin:${pin}`),
          balance: DEMO_STARTING_BALANCE,
          createdAt: now().toISOString(),
        };
        users.push(user);
        await save(USERS_KEY, users);
        return { userId: user.id, pinAttempts: 0 };
      }),

    signIn: ({ phone, password }) =>
      exclusive(async () => {
        const users = await load(USERS_KEY);
        const user = users.find((u) => u.phone === normalizePhone(phone));
        // Same message for unknown phone and wrong password, so nobody can probe which phones exist.
        if (!user || (await secret(user.salt, password)) !== user.passwordHash) {
          throw new LedgerError('BAD_LOGIN', 'Phone or password is incorrect.');
        }
        return { userId: user.id, pinAttempts: 0 };
      }),

    getMe: (session) =>
      exclusive(async () => {
        const { me } = await currentUser(session);
        return publicSelf(me);
      }),

    findRecipient: (session, phone) =>
      exclusive(async () => {
        const { users, me } = await currentUser(session);
        const target = users.find((u) => u.phone === normalizePhone(phone));
        if (!target) throw new LedgerError('NOT_FOUND', 'No SendClear account with that number.');
        if (target.id === me.id) throw new LedgerError('SELF', 'You cannot send money to yourself.');
        return publicOther(target);
      }),

    // Checks a transfer without moving money: what the Send screen calls before Confirm.
    quote: (session, { toPhone, amount }) =>
      exclusive(async () => {
        const { users, me } = await currentUser(session);
        const { to, fee } = validateTransfer(users, me, toPhone, amount);
        return { recipient: publicOther(to), amount, fee, total: amount + fee };
      }),

    listTransactions: (session) =>
      exclusive(async () => {
        const { me } = await currentUser(session);
        const txs = await load(TXS_KEY);
        return txs
          .filter((t) => t.fromId === me.id || t.toId === me.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((t) => viewTx(t, me.id));
      }),

    getTransaction: (session, txId) =>
      exclusive(async () => {
        const { me } = await currentUser(session);
        const txs = await load(TXS_KEY);
        const tx = txs.find((t) => t.id === txId);
        // A transfer between two other people looks exactly like one that does not exist.
        if (!tx || (tx.fromId !== me.id && tx.toId !== me.id)) {
          throw new LedgerError('NOT_FOUND', 'Transaction not found.');
        }
        return viewTx(tx, me.id);
      }),

    send: (session, { toPhone, amount, note, pin }) =>
      exclusive(async () => {
        const { users, me } = await currentUser(session);
        if ((session.pinAttempts || 0) >= MAX_PIN_ATTEMPTS) {
          throw new LedgerError('PIN_LOCKED', 'Too many wrong PINs. Sign in again.');
        }
        if ((await secret(me.salt, `pin:${pin}`)) !== me.pinHash) {
          session.pinAttempts = (session.pinAttempts || 0) + 1;
          const left = MAX_PIN_ATTEMPTS - session.pinAttempts;
          if (left <= 0) throw new LedgerError('PIN_LOCKED', 'Too many wrong PINs. Sign in again.');
          throw new LedgerError('BAD_PIN', `Wrong PIN. ${left} attempt${left === 1 ? '' : 's'} left.`);
        }
        session.pinAttempts = 0;

        const { to, fee } = validateTransfer(users, me, toPhone, amount);
        me.balance -= amount + fee;
        to.balance += amount;

        const id = newId();
        const tx = {
          id,
          folio: `SC-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
          fromId: me.id,
          toId: to.id,
          fromName: me.name,
          toName: to.name,
          amount,
          fee,
          note: String(note || '').trim().slice(0, 80),
          status: 'completed',
          createdAt: now().toISOString(),
        };
        const txs = await load(TXS_KEY);
        txs.push(tx);
        // Save the transaction first: if the app dies between the two writes,
        // a recorded transfer with unchanged balances is easier to spot than money that moved without a record.
        await save(TXS_KEY, txs);
        await save(USERS_KEY, users);
        return viewTx(tx, me.id);
      }),

    hasUsers: () => exclusive(async () => (await load(USERS_KEY)).length > 0),

    resetAll: () =>
      exclusive(async () => {
        await remove(USERS_KEY);
        await remove(TXS_KEY);
      }),
  };
}
