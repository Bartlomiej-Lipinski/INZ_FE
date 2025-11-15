"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGroupContext } from '@/contexts/GroupContext';


export default function GroupContextCleaner() {
  const pathname = usePathname();
  const { setCurrentGroup, currentGroup } = useGroupContext();

  useEffect(() => {
    if (!pathname?.startsWith('/group-menu') && currentGroup !== null) {
      setCurrentGroup(null);
    }
  }, [pathname, setCurrentGroup]);

  return null;
}

