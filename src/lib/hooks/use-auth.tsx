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
  // This function allows switching users in demo mode by userId
  loginAs: (userId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Read the initial user ID from localStorage
    const savedUserId = localStorage.getItem('demoUserId');
    
    if (savedUserId) {
        const mockUser = DUMMY_USERS.find((u) => u.uid === savedUserId) as UserProfile | undefined;
        setUser(mockUser || null);
        if (mockUser) {
            document.cookie = `firebase-auth-token=mock-token; path=/; max-age=3600`;
        }
    }


    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !firebaseUser) {
        // The logic is now handled by the loginAs function and the initial localStorage read
      } else {
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

    setLoading(false);
    return () => {
        if(unsubscribe) unsubscribe();
    };
  }, [isClient]);

  const loginAs = (userId: string | null) => {
    if (typeof window !== 'undefined') {
      if (userId) {
        localStorage.setItem('demoUserId', userId);
        const mockUser = DUMMY_USERS.find((u) => u.uid === userId) as UserProfile | undefined;
        setUser(mockUser || null);
        document.cookie = `firebase-auth-token=mock-token; path=/; max-age=3600`;
      } else {
        localStorage.removeItem('demoUserId');
        setUser(null);
        document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
      }
    }
  };
  
  if (loading && !isClient) {
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
