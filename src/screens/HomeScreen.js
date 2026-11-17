import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, FadeIn, Screen, SimulatedBadge, TxRow } from '../components/ui';
import { useAuth } from '../auth';
import { ledger } from '../services';
import { colors, formatAmount, radius, shadow, space, type } from '../theme';

// How a transfer works, in the order the user lives it. Same rules as ledger.js (fee 1%, cap MXN 15).
const STEPS = [
  { n: '1', title: 'Type a phone', body: 'You see their name before sending' },
  { n: '2', title: 'See the fee', body: '1%, never more than MXN 15' },
  { n: '3', title: 'Get a receipt', body: 'With a folio, in your history' },
];

export default function HomeScreen({ navigation }) {
  const { session, signOut } = useAuth();
  const [me, setMe] = useState(null);
  const [txs, setTxs] = useState([]);

  // Reload every time the screen comes back into view (e.g. after a transfer).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([ledger.getMe(session), ledger.listTransactions(session)])
        .then(([m, t]) => {
          if (active) {
            setMe(m);
            setTxs(t);
          }
        })
        .catch(signOut);
      return () => {
        active = false;
      };
    }, [session, signOut])
  );

  if (!me) return <Screen />;

  return (
    <Screen>
      <Text style={[type.footnote, { color: colors.muted, marginTop: space.s }]}>Welcome back</Text>
      <Text style={[type.largeTitle, { color: colors.text, marginBottom: space.l }]} numberOfLines={1}>
        Hi, {me.name.split(' ')[0]}
      </Text>

      {/* Balance and the action that spends it live together (proximity = relationship). */}
      <FadeIn style={s.balance}>
        <Text style={[type.footnote, { color: colors.goldSoft }]}>Available balance</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: space.xs }}>
          <Text style={[type.headline, { color: colors.gold, marginTop: 8, marginRight: 6 }]}>MXN</Text>
          <Text style={[type.display, { color: colors.white, flexShrink: 1 }]} adjustsFontSizeToFit numberOfLines={1}>
            {formatAmount(me.balance)}
          </Text>
        </View>
        <Text style={[type.footnote, { color: '#A9B6CC', marginTop: space.s, marginBottom: space.m }]}>
          Your SendClear number · <Text style={[type.money, { color: colors.white }]}>{me.phone}</Text>
        </Text>
        <SimulatedBadge onDark />
        <Button title="Send money" onPress={() => navigation.navigate('Send')} />
      </FadeIn>

      <View style={s.steps}>
        {STEPS.map((st) => (
          <View key={st.n} style={s.step}>
            <View style={s.stepNum}>
              <Text style={{ color: colors.navy, fontWeight: '800', fontSize: 13 }}>{st.n}</Text>
            </View>
            <Text style={[type.footnote, { color: colors.text, fontWeight: '700', marginTop: space.s }]}>{st.title}</Text>
            <Text style={[type.footnote, { color: colors.muted, marginTop: 2 }]}>{st.body}</Text>
          </View>
        ))}
      </View>

      <View style={s.sectionHead}>
        <Text style={[type.title, { color: colors.text }]}>Recent activity</Text>
        <Pressable onPress={() => navigation.navigate('History')} hitSlop={12} accessibilityRole="button">
          <Text style={[type.headline, { color: colors.gold }]}>See all</Text>
        </Pressable>
      </View>
      <Card style={{ paddingVertical: space.xs }}>
        {txs.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: space.xl, paddingHorizontal: space.m }}>
            <View style={s.emptyIcon}>
              <Text style={{ color: colors.gold, fontSize: 22, fontWeight: '800' }}>↑</Text>
            </View>
            <Text style={[type.headline, { color: colors.text, marginTop: space.m }]}>No transfers yet</Text>
            <Text style={[type.footnote, { color: colors.muted, marginTop: space.xs, textAlign: 'center' }]}>
              Try one with a test user: Carla Prueba, 5550000003.
            </Text>
          </View>
        ) : (
          txs.slice(0, 5).map((tx, i, list) => (
            <TxRow key={tx.id} tx={tx} last={i === list.length - 1} onPress={() => navigation.navigate('Receipt', { txId: tx.id })} />
          ))
        )}
      </Card>

      <Button title="Sign out" variant="ghost" onPress={signOut} />
    </Screen>
  );
}

const s = StyleSheet.create({
  balance: { backgroundColor: colors.navy, borderRadius: radius.card, padding: space.xl, marginBottom: space.l, ...shadow, shadowOpacity: 0.25 },
  steps: { flexDirection: 'row', gap: space.s, marginBottom: space.xl },
  step: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: space.m, ...shadow },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.s, paddingHorizontal: space.xs },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});
