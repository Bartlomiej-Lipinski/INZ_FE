"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/lib/types/user';
import { setLogoutCallback } from '@/lib/api/fetch-with-auth';


interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'auth:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((value: User | null) => {
    setUserState(value);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (value) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Could not set user:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUserState(parsedUser);
        }
      } catch (error) {
        console.error('Could not get user from localStorage:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setIsLoading(false);

    setLogoutCallback(() => {
      setUser(null);
    });
  }, [setUser]);

  const value: AuthContextType = {
    user: userState,
    setUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
