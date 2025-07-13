import { useEffect } from 'react';
import { useUser } from '@/components/UserProvider';

export function usePingPresence() {
  const { user } = useUser();

  useEffect(() => {
    if (!user || !user.loggedIn) return;

    const ping = () => {
      fetch('/api/users/ping', { method: 'POST', credentials: 'include' })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.warn('[PING] Erreur ping:', res.status, data);
          } else {
            const data = await res.json().catch(() => ({}));
            console.log('[PING] Réponse OK:', data);
            // Dispatch custom event pour auto-refresh
            window.dispatchEvent(new Event('presence-pinged'));
          }
        })
        .catch((err) => {
          console.error('[PING] Erreur réseau:', err);
        });
    };

    // Ping immédiatement au montage
    ping();
    // Puis toutes les 20 secondes (temps réel)
    const interval = setInterval(ping, 20000);
    return () => clearInterval(interval);
  }, [user]);
} 