import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/UserProvider';

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  marketPrice: number;
  float?: number;
  csfloatLink?: string;
  rarityCode?: string;
}

interface UseInventoryOptions {
  appid?: string; // Ne pas mettre de valeur par défaut: undefined signifie "ne pas charger"
  currency?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  autoLoad?: boolean; // Nouveau: contrôle explicite du chargement initial
}

interface InventoryResponse {
  items: InventoryItem[];
  lastUpdated: number;
  stale?: boolean;
  message?: string;
  success: boolean;
}

// Cache mémoire au niveau du module pour persister entre pages (SPA)
const clientInventoryCache: Map<string, { data: InventoryResponse; timestamp: number }> = new Map();

export function useInventory(options: UseInventoryOptions = {}) {
  const { appid, currency = 'EUR', autoRefresh = false, refreshInterval = 300000, autoLoad = false } = options;
  const { user } = useUser();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [stale, setStale] = useState<boolean>(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  // Ne pas expirer automatiquement: on conserve l'inventaire jusqu'au refresh manuel ou reload
  const CACHE_DURATION = Number.POSITIVE_INFINITY;

  const fetchInventory = useCallback(async (force = false) => {
    // Ne jamais charger si l'appid n'est pas fourni
    if (!appid) return;
    if (!user?.steamId) {
      setError('Utilisateur non connecté');
      return;
    }

    const cacheKey = `${user.steamId}-${appid}-${currency}`;
    const now = Date.now();
    const cached = clientInventoryCache.get(cacheKey);

    // Utiliser systématiquement le cache si présent et qu'on ne force pas
    if (!force && cached) {
      setItems(cached.data.items);
      setLastUpdated(cached.data.lastUpdated);
      setStale(cached.data.stale || false);
      setCacheMessage(cached.data.message || null);
      setError(null);
      return;
    }

    // Vérifier la limitation de débit côté client
    if (!force && now - lastFetch < 10000) { // 10 secondes entre les requêtes
      setError('Veuillez attendre avant de rafraîchir');
      return;
    }

    setLoading(true);
    setError(null);
    setStale(false);
    setCacheMessage(null);

    try {
      const response = await fetch(`/api/inventory-cache?appid=${appid}&currency=${currency}`, { cache: 'no-store' });
      
      if (response.status === 429) {
        const errorData = await response.json();
        setError(`Limite de requêtes dépassée. Réessayez dans ${Math.ceil((errorData.retryAfter || 60) / 1000)} secondes.`);
        return;
      }

      if (!response.ok) {
        let msg = 'Erreur lors du chargement de l\'inventaire';
        try {
          const errorData = await response.json();
          msg = errorData.error || msg;
        } catch {}
        setError(msg);
        setLoading(false);
        return;
      }

       const data: InventoryResponse = await response.json();
      
      if (data.success) {
        setItems(data.items || []);
        setLastUpdated(data.lastUpdated || 0);
        setStale(data.stale || false);
        setCacheMessage(data.message || null);
        
        // Mettre en cache (mémoire module pour persister entre pages)
        clientInventoryCache.set(cacheKey, { data, timestamp: now });
        setLastFetch(now);
      } else {
        setError(data.message || 'Erreur lors du chargement de l\'inventaire');
      }
    } catch (err) {
      setError('Erreur réseau lors du chargement de l\'inventaire');
    } finally {
      setLoading(false);
    }
  }, [user?.steamId, appid, currency, lastFetch]);

  // Auto-refresh (désactivé par défaut)
  useEffect(() => {
    if (!autoRefresh || !user?.steamId || !appid) return;

    const interval = setInterval(() => {
      fetchInventory();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, user?.steamId, refreshInterval, fetchInventory]);

  // Chargement initial contrôlé
  useEffect(() => {
    if (autoLoad && user?.steamId && appid) {
      fetchInventory();
    }
  }, [autoLoad, user?.steamId, appid, currency, fetchInventory]);

  const refresh = useCallback(() => {
    fetchInventory(true);
  }, [fetchInventory]);

  return {
    items,
    loading,
    error,
    refresh,
    lastFetch,
    lastUpdated,
    stale,
    cacheMessage
  };
} 