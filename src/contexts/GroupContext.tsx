"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Group } from '@/lib/types/group';
import { useAuthContext } from './AuthContext';

interface GroupContextType {
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

const GROUP_STORAGE_KEY = 'currentGroup';

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [currentGroup, setCurrentGroupState] = useState<Group | null>(null);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    if (user && !hasLoadedFromStorage.current && typeof window !== 'undefined') {
      hasLoadedFromStorage.current = true;
      const stored = localStorage.getItem(GROUP_STORAGE_KEY);
      if (stored) {
        try {
          const parsedGroup = JSON.parse(stored);
          setCurrentGroupState(parsedGroup);
        } catch {
          localStorage.removeItem(GROUP_STORAGE_KEY);
        }
      }
    } else if (!user) {
      hasLoadedFromStorage.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (currentGroup && user) {
      localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(currentGroup));
    }
  }, [currentGroup, user]);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(GROUP_STORAGE_KEY);
      setCurrentGroupState(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && !currentGroup && typeof window !== 'undefined') {
      const stored = localStorage.getItem(GROUP_STORAGE_KEY);
      if (stored) {
        localStorage.removeItem(GROUP_STORAGE_KEY);
      }
    }
  }, [currentGroup, user]);

  const setCurrentGroup = useCallback((group: Group | null) => {
    setCurrentGroupState(group);
  }, []);

  const value: GroupContextType = {
    currentGroup: currentGroup,
    setCurrentGroup,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroupContext() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroupContext must be used within a GroupProvider');
  }
  return context;
}

