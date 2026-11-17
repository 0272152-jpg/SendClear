import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Card, ErrorText, FadeIn, Field, Screen, SimulatedBadge, styles } from '../components/ui';
import { useAuth } from '../auth';
import { ledger } from '../services';
import { calcFee } from '../core/ledger';
import { colors, formatMXN, parseMXN, space, type } from '../theme';

// Step 1 of a transfer: who and how much. Nothing moves until the PIN on the next screen.
export default function SendScreen({ navigation }) {
  const { session } = useAuth();
  const [phone, setPhone] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // The phone currently typed. A lookup that finishes after the phone changed is ignored,
  // so the card can never show someone other than who the money goes to.
  const latestPhone = useRef('');
  const amountInput = useRef(null);

  const amount = parseMXN(amountText);
  const validAmount = Number.isInteger(amount) && amount > 0;

  async function onPhoneChange(value) {
    setPhone(value);
    latestPhone.current = value;
    setRecipient(null);
    setError('');
    if (value.replace(/\D/g, '').length === 10) {
      try {
        const found = await ledger.findRecipient(session, value);
        if (latestPhone.current === value) {
          setRecipient(found);
          amountInput.current?.focus(); // move on to the next step automatically
        }
      } catch (e) {
        if (latestPhone.current === value) setError(e.message);
      }
    }
  }

  async function onContinue() {
    setError('');
    if (!recipient) return setError('Enter the 10-digit number of a SendClear user.');
    if (!validAmount) return setError('Enter a valid amount, e.g. 150 or 150.50.');
    setLoading(true);
    try {
      // The ledger checks limit, recipient and balance; the screen only shows its answer.
      const quote = await ledger.quote(session, { toPhone: phone, amount });
      navigation.navigate('Confirm', { toPhone: phone, recipient: quote.recipient, amount, note });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SimulatedBadge />
      <Field label="To" placeholder="Recipient's 10-digit phone" value={phone} onChangeText={onPhoneChange} keyboardType="number-pad" maxLength={10} autoFocus />

      {recipient && (
        <FadeIn>
          <Card style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.gold, marginTop: -space.s }}>
            <View style={[styles.avatar, { backgroundColor: colors.navy }]}>
              <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 17 }}>{recipient.name[0]}</Text>
            </View>
            <View style={{ marginLeft: space.m }}>
              <Text style={[type.headline, { color: colors.text }]}>{recipient.name}</Text>
              <Text style={[type.footnote, { color: colors.muted }]}>{recipient.phoneMasked}</Text>
            </View>
          </Card>
        </FadeIn>
      )}

      {/* The amount is the most important thing on this screen, so it is the biggest. */}
      <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
        <Text style={[type.footnote, { color: colors.muted }]}>Amount</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: space.xs }}>
          <Text style={[type.headline, { color: colors.gold, marginTop: 10, marginRight: 6 }]}>MXN</Text>
          <TextInput
            ref={amountInput}
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#C3C8D2"
            style={[type.display, { color: colors.text, minWidth: 120, padding: 0 }]}
            accessibilityLabel="Amount in Mexican pesos"
          />
        </View>
        <Text style={[type.footnote, type.money, { color: colors.muted, marginTop: space.s }]}>
          {validAmount
            ? `Fee ${formatMXN(calcFee(amount))} · Total ${formatMXN(amount + calcFee(amount))}`
            : 'Fee: 1% of the amount, max MXN 15.00'}
        </Text>
      </Card>

      <Field label="Note (optional)" placeholder="What is it for?" value={note} onChangeText={setNote} maxLength={80} autoCapitalize="sentences" />
      <ErrorText>{error}</ErrorText>
      <Button title="Review transfer" onPress={onContinue} loading={loading} disabled={!recipient || !validAmount} />
    </Screen>
  );
}
