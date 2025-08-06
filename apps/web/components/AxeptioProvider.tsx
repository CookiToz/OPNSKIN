'use client';

import { useEffect } from 'react';
import { initAxeptio } from '@/lib/axeptio';

export function AxeptioProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialiser Axeptio côté client
    initAxeptio();
  }, []);

  return <>{children}</>;
} 