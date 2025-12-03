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
import type { UserProfile } from '@/lib/types';
import { DUMMY_USERS } from '@/lib/data';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  // This function allows switching users in demo mode
  loginAs: (role: 'admin' | 'staff' | 'student' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // This is for the demo mode to allow switching between users.
  // In a real app, you would remove `loginAs` and the corresponding logic.
  const [demoRole, setDemoRole] = useState<'admin' | 'staff' | 'student' | null>(null);

  useEffect(() => {
    // Access localStorage only on the client
    setDemoRole((localStorage.getItem('demoRole') as 'admin' | 'staff' | 'student' | null) ?? 'student');
  }, []);

  const loginAs = (role: 'admin' | 'staff' | 'student' | null) => {
    setDemoRole(role);
    if (typeof window !== 'undefined') {
      if(role) {
        localStorage.setItem('demoRole', role);
      } else {
        localStorage.removeItem('demoRole');
      }
    }
  };


  useEffect(() => {
    // Don't run auth logic until the demoRole has been determined from localStorage
    if (demoRole === null && typeof window !== 'undefined') {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      // START MOCK LOGIC - Remove for production
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !firebaseUser) {
        const mockUser = DUMMY_USERS.find((u) => u.role === (demoRole || 'student')) as UserProfile | undefined;
        setUser(mockUser || null);
        setLoading(false);
        if (typeof document !== 'undefined') {
          if (mockUser && demoRole) {
            document.cookie = `firebase-auth-token=mock-token; path=/; max-age=3600`;
          } else {
            document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
          }
        }
        return;
      }
      // END MOCK LOGIC

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() } as UserProfile);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setUser(null);
        }
        const token = await firebaseUser.getIdToken();
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600`;
      } else {
        setUser(null);
        document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoRole]);

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
