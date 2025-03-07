// app/context/UserContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User, IdTokenResult } from 'firebase/auth';
import { auth } from '../utils/firebase';

// Define the expected shape of the claims object
interface CustomClaims {
  email?: string;
  [key: string]: any; // Allow other claims
}

interface UserContextType {
  user: User | null;
  email: string | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          // Fetch custom claims from ID token
          const idTokenResult: IdTokenResult =
            await currentUser.getIdTokenResult();

          // Type the claims object
          const claims = idTokenResult.claims as CustomClaims;

          // Determine email: check email, providerData, then custom claims
          const userEmail =
            currentUser.email ||
            currentUser.providerData.find((p) => p.email)?.email ||
            claims.email ||
            null;

          setUser(currentUser);
          setEmail(userEmail); // Now type-safe
          setError(null);
        } else {
          setUser(null);
          setEmail(null);
          setError(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error.message, error.name);
        setUser(null);
        setEmail(null);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const value = { user, email, loading, error };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
