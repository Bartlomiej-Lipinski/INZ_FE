"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Group } from '@/lib/types/group';

interface GroupContextType {
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const value: GroupContextType = {
    currentGroup,
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

