import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorText, FadeIn, Field, Screen, SimulatedBadge } from '../components/ui';
import { useAuth } from '../auth';
import { hapticError } from '../feedback';
import { demoWarning, ledger, resetDemoData } from '../services';
import { colors, radius, space, type } from '../theme';

// The three promises of the product, shown once on the landing screen.
const POINTS = [
  { icon: '#', title: 'Just a phone number', body: 'No 18-digit CLABE to ask for.' },
  { icon: '%', title: 'Fee before you pay', body: '1%, never more than MXN 15.' },
  { icon: '✓', title: 'A receipt to share', body: 'Every transfer gets a folio.' },
];

export default function SignInScreen({ navigation }) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const ready = phone.length === 10 && password.length > 0;

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      signIn(await ledger.signIn({ phone, password }));
    } catch (e) {
      hapticError();
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    Alert.alert('Reset demo data?', 'Deletes every account and transfer on this phone and loads the invented test data again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetDemoData().then(() => Alert.alert('Done', 'Demo data reloaded.')) },
    ]);
  }

  return (
    <Screen dark topInset>
      <FadeIn style={s.hero}>
        <View style={s.brandRow}>
          <View style={s.logo}>
            <Text style={s.logoText}>S</Text>
          </View>
          <Text style={s.brand}>SendClear</Text>
        </View>
        <Text style={s.headline}>
          Pay a friend back.{'\n'}
          <Text style={{ color: colors.goldBright }}>See the fee first.</Text>
        </Text>
      </FadeIn>

      <View style={s.points}>
        {POINTS.map((p) => (
          <View key={p.title} style={s.point}>
            <View style={s.pointIcon}>
              <Text style={s.pointIconText}>{p.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[type.headline, { color: colors.white }]}>{p.title}</Text>
              <Text style={[type.footnote, { color: '#A9B6CC', marginTop: 1 }]}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={[type.title, { color: colors.white, marginBottom: space.m }]}>Sign in</Text>
        <SimulatedBadge onDark text="TEST ENVIRONMENT · invented data only" />
        <Field dark label="Phone" placeholder="10 digits" value={phone} onChangeText={setPhone} keyboardType="number-pad" maxLength={10} textContentType="telephoneNumber" style={s.input} />
        <Field dark label="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" onSubmitEditing={ready ? onSubmit : undefined} style={s.input} />
        <ErrorText>{error}</ErrorText>
        <Button title="Sign in" onPress={onSubmit} loading={loading} disabled={!ready} />
      </View>

      <Pressable onPress={() => navigation.navigate('SignUp')} style={s.link} accessibilityRole="link">
        <Text style={[type.body, { color: colors.white }]}>
          New here? <Text style={{ color: colors.goldBright, fontWeight: '700' }}>Create an account</Text>
        </Text>
      </Pressable>

      {demoWarning ? (
        <Text style={[type.footnote, { color: colors.goldSoft, textAlign: 'center', marginTop: space.l }]}>{demoWarning}</Text>
      ) : null}

      <Pressable onPress={onReset} style={[s.link, { marginTop: space.xxl }]} accessibilityRole="button">
        <Text style={[type.footnote, { color: '#8C9BB5' }]}>Reset demo data</Text>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { marginTop: space.xxl, marginBottom: space.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.xxl },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.m,
  },
  logoText: { color: colors.navy, fontSize: 21, fontWeight: '900', letterSpacing: -1 },
  brand: { ...type.title, color: colors.white },
  headline: { fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: -1, color: colors.white },
  points: { marginBottom: space.xxl },
  point: { flexDirection: 'row', alignItems: 'center', marginBottom: space.l },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(201,162,39,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.m,
  },
  pointIconText: { color: colors.goldBright, fontSize: 16, fontWeight: '800' },
  card: {
    backgroundColor: colors.navySoft,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.navyLine,
    padding: space.xl,
  },
  input: { backgroundColor: colors.navy },
  link: { marginTop: space.xl, alignItems: 'center', padding: space.s },
});
