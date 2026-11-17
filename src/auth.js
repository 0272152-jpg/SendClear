import { createContext, useContext } from 'react';

// session = { userId, pinAttempts }. Also saved on the phone so the app reopens signed in (D21);
// Sign out, 3 wrong PINs or Reset demo data forget it.
export const AuthContext = createContext({ session: null, signIn: () => {}, signOut: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}
