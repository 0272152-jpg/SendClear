import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { Button, Card, ErrorText, FadeIn, Row, Screen, SimulatedBadge } from '../components/ui';
import { useAuth } from '../auth';
import { hapticSuccess, useReducedMotion } from '../feedback';
import { ledger } from '../services';
import { colors, formatAmount, formatDate, formatMXN, space, springs, type } from '../theme';

export default function ReceiptScreen({ navigation, route }) {
  const { session } = useAuth();
  const { txId, justSent } = route.params;
  const [tx, setTx] = useState(null);
  const [error, setError] = useState('');
  const reduced = useReducedMotion();
  const checkScale = useRef(new Animated.Value(justSent ? 0.6 : 1)).current;
  const checkOpacity = useRef(new Animated.Value(justSent ? 0 : 1)).current;

  useEffect(() => {
    ledger.getTransaction(session, txId).then(setTx).catch((e) => setError(e.message));
  }, [session, txId]);

  // Right after sending: the check mark grows in and the success haptic fires on the same frame.
  // Critically damped, no bounce: this is a confirmation, not a celebration.
  useEffect(() => {
    if (!tx || !justSent) return;
    hapticSuccess();
    Animated.parallel([
      Animated.timing(checkOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      reduced ? Animated.timing(checkScale, { toValue: 1, duration: 0, useNativeDriver: true }) : Animated.spring(checkScale, { toValue: 1, ...springs.ui }),
    ]).start();
  }, [tx, justSent, reduced, checkOpacity, checkScale]);

  if (error) return <Screen><ErrorText>{error}</ErrorText></Screen>;
  if (!tx) return <Screen />;

  const sent = tx.direction === 'sent';
  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: space.m, marginBottom: space.xl }}>
        <Animated.View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: sent ? colors.gold : colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: checkOpacity,
            transform: [{ scale: checkScale }],
          }}
        >
          <Text style={{ fontSize: 34, color: sent ? colors.navy : colors.white, fontWeight: '900' }}>{sent ? '✓' : '↓'}</Text>
        </Animated.View>
        <Text style={[type.title, { color: colors.text, marginTop: space.l }]}>
          {justSent ? 'Transfer sent' : sent ? `You sent ${tx.toName.split(' ')[0]}` : `${tx.fromName.split(' ')[0]} sent you`}
        </Text>
        <Text style={[type.display, { color: colors.navy, marginTop: space.xs }]}>{formatAmount(tx.amount)}</Text>
        <Text style={[type.footnote, { color: colors.muted }]}>MXN</Text>
      </View>

      <FadeIn>
        <Card style={{ borderTopWidth: 4, borderTopColor: colors.gold }}>
          <Row label="Folio" value={tx.folio} bold />
          <Row label="Date" value={formatDate(tx.createdAt)} />
          <Row label="From" value={tx.fromName} />
          <Row label="To" value={tx.toName} />
          <Row label="Amount" value={formatMXN(tx.amount)} />
          {sent && <Row label="Fee" value={formatMXN(tx.fee)} />}
          {sent && <Row label="Total charged" value={formatMXN(tx.total)} bold />}
          {tx.note ? <Row label="Note" value={tx.note} /> : null}
          <Row label="Status" value={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)} />
        </Card>
      </FadeIn>
      <SimulatedBadge text="SIMULATED TRANSFER · not a real SPEI payment" />
      <Button title="Done" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}
