import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Button, ErrorText, Field, Screen, SimulatedBadge } from '../components/ui';
import { useAuth } from '../auth';
import { hapticError } from '../feedback';
import { demoWarning, ledger, resetDemoData } from '../services';
import { colors, space, type } from '../theme';

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
      <View style={{ marginTop: 48, marginBottom: space.xxl + 8 }}>
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: space.l }}>
          <Text style={{ color: colors.navy, fontSize: 26, fontWeight: '900', letterSpacing: -1 }}>S</Text>
        </View>
        <Text style={[type.largeTitle, { color: colors.white, fontSize: 40, lineHeight: 44, letterSpacing: -1 }]}>SendClear</Text>
        <Text style={[type.body, { color: colors.goldSoft, marginTop: space.s }]}>
          Send money with just a phone number.{'\n'}The fee is always shown before you pay.
        </Text>
      </View>

      <SimulatedBadge onDark text="TEST ENVIRONMENT · invented data only" />
      <Field dark label="Phone" placeholder="10 digits" value={phone} onChangeText={setPhone} keyboardType="number-pad" maxLength={10} textContentType="telephoneNumber" />
      <Field dark label="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" onSubmitEditing={ready ? onSubmit : undefined} />
      <ErrorText>{error}</ErrorText>
      <Button title="Sign in" onPress={onSubmit} loading={loading} disabled={!ready} />

      <Pressable onPress={() => navigation.navigate('SignUp')} style={{ marginTop: space.xl, alignItems: 'center', padding: space.s }} accessibilityRole="link">
        <Text style={[type.body, { color: colors.white }]}>
          New here? <Text style={{ color: colors.goldBright, fontWeight: '700' }}>Create an account</Text>
        </Text>
      </Pressable>

      {demoWarning ? (
        <Text style={[type.footnote, { color: colors.goldSoft, textAlign: 'center', marginTop: space.xxl }]}>{demoWarning}</Text>
      ) : null}

      <Pressable onPress={onReset} style={{ marginTop: space.xxl + 12, alignItems: 'center', padding: space.s }}>
        <Text style={[type.footnote, { color: '#8C9BB5' }]}>Reset demo data</Text>
      </Pressable>
    </Screen>
  );
}
