'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const init = useAuthStore.getState().init;
      init();
    } catch (error) {
      console.error('Erro ao inicializar auth store:', error);
    }
  }, []);

  return <>{children}</>;
}
