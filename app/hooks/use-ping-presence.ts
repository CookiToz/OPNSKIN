import { useEffect } from 'react';
import { useUser } from '@/components/UserProvider';

export function usePingPresence() {
  const { user } = useUser();

  useEffect(() => {
    if (!user || !user.loggedIn) return;

    const ping = () => {
      fetch('/api/users/ping', { method: 'POST' });
    };

    // Ping immédiatement au montage
    ping();
    // Puis toutes les 60 secondes
    const interval = setInterval(ping, 60000);
    return () => clearInterval(interval);
  }, [user]);
} 