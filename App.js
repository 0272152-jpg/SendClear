import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from './src/auth';
import { clearSession, restoreSession, saveSession, seedIfEmpty } from './src/services';
import { colors } from './src/theme';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import SendScreen from './src/screens/SendScreen';
import ConfirmScreen from './src/screens/ConfirmScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator();

const header = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.gold,
  headerTitleStyle: { color: colors.white, fontWeight: '800' },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
};

// No iOS large titles: our screens wrap the ScrollView in SafeAreaView, so on recent iOS the
// large title area rendered empty. Home shows its own big greeting inside the screen instead.

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // A failed seed must not block the app; the sign-in screen explains missing demo accounts.
    // Then reopen the last session, if this phone remembers one (D21).
    seedIfEmpty()
      .catch(() => {})
      .then(restoreSession)
      .then((s) => s && setSession(s))
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback((s) => {
    setSession(s);
    saveSession(s).catch(() => {});
  }, []);
  const signOut = useCallback(() => {
    setSession(null);
    clearSession().catch(() => {});
  }, []);
  const auth = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={auth}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={header}>
            {session ? (
              // Signed in: these screens exist only while there is a session.
              <>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SendClear' }} />
                <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send money' }} />
                <Stack.Screen name="Confirm" component={ConfirmScreen} options={{ title: 'Review' }} />
                <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
                <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'All transfers' }} />
              </>
            ) : (
              <>
                <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
