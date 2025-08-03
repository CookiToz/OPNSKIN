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
  appid?: string;
  currency?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface InventoryResponse {
  items: InventoryItem[];
  lastUpdated: number;
  stale?: boolean;
  message?: string;
  success: boolean;
}

export function useInventory(options: UseInventoryOptions = {}) {
  const { appid = '730', currency = 'EUR', autoRefresh = false, refreshInterval = 300000 } = options;
  const { user } = useUser();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [stale, setStale] = useState<boolean>(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  // Cache côté client
  const [cache, setCache] = useState<Map<string, { data: InventoryResponse; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchInventory = useCallback(async (force = false) => {
    if (!user?.steamId) {
      setError('Utilisateur non connecté');
      return;
    }

    const cacheKey = `${user.steamId}-${appid}-${currency}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);

    // Utiliser le cache si il est encore valide et qu'on ne force pas
    if (!force && cached && now - cached.timestamp < CACHE_DURATION) {
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
      const response = await fetch(`/api/inventory-cache?appid=${appid}&currency=${currency}`);
      
      if (response.status === 429) {
        const errorData = await response.json();
        setError(`Limite de requêtes dépassée. Réessayez dans ${Math.ceil((errorData.retryAfter || 60) / 1000)} secondes.`);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement de l\'inventaire');
        return;
      }

      const data: InventoryResponse = await response.json();
      
      if (data.success) {
        setItems(data.items || []);
        setLastUpdated(data.lastUpdated || 0);
        setStale(data.stale || false);
        setCacheMessage(data.message || null);
        
        // Mettre en cache
        setCache(prev => new Map(prev).set(cacheKey, { data, timestamp: now }));
        setLastFetch(now);
      } else {
        setError(data.message || 'Erreur lors du chargement de l\'inventaire');
      }
    } catch (err) {
      setError('Erreur réseau lors du chargement de l\'inventaire');
    } finally {
      setLoading(false);
    }
  }, [user?.steamId, appid, currency, cache, lastFetch]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user?.steamId) return;

    const interval = setInterval(() => {
      fetchInventory();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, user?.steamId, refreshInterval, fetchInventory]);

  // Chargement initial
  useEffect(() => {
    if (user?.steamId) {
      fetchInventory();
    }
  }, [user?.steamId, appid, currency]);

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