import { useState } from 'react';
import { Text } from 'react-native';
import { Button, ErrorText, Field, Screen, SimulatedBadge } from '../components/ui';
import { useAuth } from '../auth';
import { hapticError } from '../feedback';
import { ledger } from '../services';
import { colors, formatMXN, space, type } from '../theme';
import { DEMO_STARTING_BALANCE, isValidPassword, isValidPin } from '../core/ledger';

export default function SignUpScreen() {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', password: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // Inline hints: tell people what is missing while they type, not only after submitting.
  const hints = {
    phone: form.phone && form.phone.length !== 10 ? `${form.phone.length}/10 digits` : null,
    password: form.password && !isValidPassword(form.password) ? `${8 - form.password.length} more characters` : null,
    pin: form.pin && !isValidPin(form.pin) ? 'Exactly 4 digits' : null,
  };

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      signIn(await ledger.signUp(form));
    } catch (e) {
      hapticError();
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SimulatedBadge text={`SIMULATED · starts with ${formatMXN(DEMO_STARTING_BALANCE)} demo money`} />
      <Text style={[type.body, { color: colors.muted, marginBottom: space.xl }]}>
        Use invented data only. No identity check is run (simulated KYC).
      </Text>
      <Field label="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" textContentType="name" />
      <Field label="Phone" placeholder="10 digits" value={form.phone} onChangeText={set('phone')} keyboardType="number-pad" maxLength={10} hint={hints.phone} />
      <Field label="Password" placeholder="8 or more characters" value={form.password} onChangeText={set('password')} secureTextEntry textContentType="newPassword" hint={hints.password} />
      <Field
        label="Transfer PIN"
        placeholder="4 digits"
        value={form.pin}
        onChangeText={set('pin')}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        hint={hints.pin || 'You will enter it to confirm every transfer.'}
      />
      <ErrorText>{error}</ErrorText>
      <Button title="Create account" onPress={onSubmit} loading={loading} />
    </Screen>
  );
}
