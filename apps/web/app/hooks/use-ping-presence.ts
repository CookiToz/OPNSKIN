import { useEffect } from 'react';
import { useUser } from '@/components/UserProvider';

export function usePingPresence() {
  const { user } = useUser();

  useEffect(() => {
    if (!user || !user.loggedIn) return;

    const ping = () => {
      fetch('/api/users/ping', { method: 'POST', credentials: 'include' })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          
          if (res.ok) {
            if (data.success) {
              console.log('[PING] Utilisateur en ligne:', data);
              // Dispatch custom event pour auto-refresh
              window.dispatchEvent(new Event('presence-pinged'));
            } else {
              // Utilisateur non connecté - pas d'erreur, juste silencieux
              console.log('[PING] Utilisateur non connecté');
            }
          } else {
            // Vraie erreur (pas 401)
            console.warn('[PING] Erreur ping:', res.status, data);
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