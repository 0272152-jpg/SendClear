import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, ErrorText, PinInput, Row, Screen, SimulatedBadge } from '../components/ui';
import { useAuth } from '../auth';
import { hapticError } from '../feedback';
import { ledger } from '../services';
import { calcFee } from '../core/ledger';
import { colors, formatAmount, formatMXN, space, type } from '../theme';

// Step 2: review and confirm with the PIN. This is where money actually moves.
export default function ConfirmScreen({ navigation, route }) {
  const { session, signOut } = useAuth();
  const { toPhone, recipient, amount, note } = route.params;
  const fee = calcFee(amount);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [loading, setLoading] = useState(false);
  // A ref changes immediately, unlike state, so a second fast tap is ignored
  // even before the button re-renders as disabled. Prevents duplicate transfers.
  const sending = useRef(false);

  async function onSend() {
    if (sending.current) return;
    sending.current = true;
    setError('');
    setLoading(true);
    try {
      const tx = await ledger.send(session, { toPhone, amount, note, pin });
      // Replace the send flow with the receipt so "back" cannot resubmit the transfer.
      navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Receipt', params: { txId: tx.id, justSent: true } }] });
    } catch (e) {
      // Shake, red boxes and error haptic fire together, on the same frame as the message.
      hapticError();
      if (e.code === 'PIN_LOCKED') {
        signOut();
        return;
      }
      setError(e.message);
      setShakeKey((k) => k + 1);
      setPin('');
      sending.current = false;
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SimulatedBadge />
      <View style={{ alignItems: 'center', marginVertical: space.l }}>
        <Text style={[type.footnote, { color: colors.muted }]}>You are sending</Text>
        <Text style={[type.display, { color: colors.text, marginTop: space.xs }]}>{formatAmount(amount)}</Text>
        <Text style={[type.body, { color: colors.muted, marginTop: space.xs }]}>
          to <Text style={{ color: colors.text, fontWeight: '700' }}>{recipient.name}</Text> · {recipient.phoneMasked}
        </Text>
      </View>

      <Card>
        <Row label="Amount" value={formatMXN(amount)} />
        <Row label="Fee (1%, max MXN 15)" value={formatMXN(fee)} />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: space.xs }} />
        <Row label="Total charged" value={formatMXN(amount + fee)} bold />
        {note ? <Row label="Note" value={note} /> : null}
      </Card>

      <Text style={[type.headline, { color: colors.text, textAlign: 'center', marginTop: space.s }]}>Enter your PIN to send</Text>
      <PinInput value={pin} onChange={(v) => { setPin(v); if (error) setError(''); }} shakeKey={shakeKey} error={!!error} />
      <View style={{ alignItems: 'center' }}>
        <ErrorText>{error}</ErrorText>
      </View>
      <Button title={`Send ${formatMXN(amount + fee)}`} onPress={onSend} loading={loading} disabled={pin.length !== 4} variant="navy" />
    </Screen>
  );
}
