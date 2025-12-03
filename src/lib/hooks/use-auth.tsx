'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { UserProfile, UserRole } from '@/lib/types';
import { DUMMY_USERS } from '@/lib/data';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  // This function allows switching users in demo mode
  loginAs: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only once on the client after initial mount.
    setIsClient(true);
    
    // Read the initial role from localStorage
    const savedRole = localStorage.getItem('demoRole') as UserRole | null;

    // Set up the authentication state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      // START MOCK LOGIC - Remove for production
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !firebaseUser) {
        // Use the role from localStorage for the initial client render
        const currentRole = localStorage.getItem('demoRole') as UserRole | null;
        const mockUser = DUMMY_USERS.find((u) => u.role === currentRole) as UserProfile | undefined;
        setUser(mockUser || null);
        
        if (typeof document !== 'undefined') {
          if (mockUser && currentRole) {
            document.cookie = `firebase-auth-token=mock-token; path=/; max-age=3600`;
          } else {
            document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
          }
        }
      } else {
      // END MOCK LOGIC
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() } as UserProfile);
          } else {
            setUser(null);
          }
          const token = await firebaseUser.getIdToken();
          document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600`;
        } else {
          setUser(null);
          document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAs = (role: UserRole | null) => {
    if (typeof window !== 'undefined') {
      if (role) {
        localStorage.setItem('demoRole', role);
        const mockUser = DUMMY_USERS.find((u) => u.role === role) as UserProfile | undefined;
        setUser(mockUser || null);
        document.cookie = `firebase-auth-token=mock-token; path=/; max-age=3600`;
      } else {
        localStorage.removeItem('demoRole');
        setUser(null);
        document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
      }
    }
  };

  // On the server, and on the initial client render, don't render children.
  // This prevents the hydration mismatch.
  if (!isClient) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
