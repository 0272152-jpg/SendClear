import { createContext, useContext } from 'react';

// session = { userId, pinAttempts } kept only in memory: closing the app signs you out.
export const AuthContext = createContext({ session: null, signIn: () => {}, signOut: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}
