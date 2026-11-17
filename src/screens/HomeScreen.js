import { useCallback, useLayoutEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, FadeIn, Screen, SimulatedBadge, TxRow } from '../components/ui';
import { useAuth } from '../auth';
import { ledger } from '../services';
import { colors, formatAmount, radius, shadow, space, type } from '../theme';

export default function HomeScreen({ navigation }) {
  const { session, signOut } = useAuth();
  const [me, setMe] = useState(null);
  const [txs, setTxs] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: me ? `Hi, ${me.name.split(' ')[0]}` : 'SendClear',
      headerRight: () => (
        <Pressable onPress={signOut} hitSlop={12} accessibilityRole="button">
          <Text style={[type.headline, { color: colors.goldBright }]}>Sign out</Text>
        </Pressable>
      ),
    });
  }, [navigation, signOut, me]);

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
      {/* Balance and the action that spends it live together (proximity = relationship). */}
      <FadeIn style={{ backgroundColor: colors.navy, borderRadius: radius.card, padding: space.xl, marginBottom: space.xl, ...shadow, shadowOpacity: 0.25 }}>
        <Text style={[type.footnote, { color: colors.goldSoft }]}>Available balance</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: space.xs }}>
          <Text style={[type.headline, { color: colors.gold, marginTop: 8, marginRight: 6 }]}>MXN</Text>
          <Text style={[type.display, { color: colors.white }]} adjustsFontSizeToFit numberOfLines={1}>
            {formatAmount(me.balance)}
          </Text>
        </View>
        <Text style={[type.footnote, { color: '#A9B6CC', marginTop: space.s, marginBottom: space.m }]}>
          Your SendClear number · <Text style={[type.money, { color: colors.white }]}>{me.phone}</Text>
        </Text>
        <SimulatedBadge onDark />
        <Button title="Send money" onPress={() => navigation.navigate('Send')} />
      </FadeIn>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.s, paddingHorizontal: space.xs }}>
        <Text style={[type.title, { color: colors.text }]}>Recent activity</Text>
        {txs.length > 0 && (
          <Pressable onPress={() => navigation.navigate('History')} hitSlop={12} accessibilityRole="button">
            <Text style={[type.headline, { color: colors.gold }]}>See all</Text>
          </Pressable>
        )}
      </View>
      <Card style={{ paddingVertical: space.xs }}>
        {txs.length === 0 ? (
          <Text style={[type.body, { color: colors.muted, paddingVertical: space.l, textAlign: 'center' }]}>
            No transfers yet. Tap Send money to make your first one.
          </Text>
        ) : (
          txs.slice(0, 5).map((tx, i, list) => (
            <TxRow key={tx.id} tx={tx} last={i === list.length - 1} onPress={() => navigation.navigate('Receipt', { txId: tx.id })} />
          ))
        )}
      </Card>
    </Screen>
  );
}
