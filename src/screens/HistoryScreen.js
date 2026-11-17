import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimulatedBadge, TxRow } from '../components/ui';
import { useAuth } from '../auth';
import { ledger } from '../services';
import { colors, space, type } from '../theme';

export default function HistoryScreen({ navigation }) {
  const { session, signOut } = useAuth();
  const [txs, setTxs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      // Same as Home: if the history cannot be loaded, sign out instead of pretending it is empty.
      ledger.listTransactions(session).then(setTxs).catch(signOut);
    }, [session, signOut])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <FlatList
        data={txs}
        keyExtractor={(t) => t.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: space.xl }}
        ListHeaderComponent={
          <View>
            <SimulatedBadge />
            <Text style={[type.footnote, { color: colors.muted, marginBottom: space.m }]}>
              {txs.length} transfer{txs.length === 1 ? '' : 's'} · only yours are shown
            </Text>
          </View>
        }
        ListEmptyComponent={<Text style={[type.body, { color: colors.muted }]}>No transfers yet.</Text>}
        // Rows sit on one white card, like an iOS grouped list.
        renderItem={({ item, index }) => (
          <View
            style={[
              { backgroundColor: colors.card, paddingHorizontal: space.m },
              index === 0 && { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: space.xs },
              index === txs.length - 1 && { borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingBottom: space.xs },
            ]}
          >
            <TxRow tx={item} last={index === txs.length - 1} onPress={() => navigation.navigate('Receipt', { txId: item.id })} />
          </View>
        )}
        ListFooterComponent={<View style={{ height: space.xl }} />}
      />
    </SafeAreaView>
  );
}
