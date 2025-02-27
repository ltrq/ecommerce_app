import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../utils/firebase';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('UserProvider rendered, SSR:', typeof window === 'undefined');

  useEffect(() => {
    console.log('useEffect running, subscribing to auth');
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log('Auth State Changed:', currentUser);
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setLoading(false); // Proceed even on error
      }
    );
    return () => {
      console.log('Cleaning up auth subscription');
      unsubscribe();
    };
  }, []);

  const value = { user, loading }; // No SSR check needed with initial state
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
