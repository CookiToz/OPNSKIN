'use client';
import { useEffect, useState } from 'react';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,ripple,litecoin,tron,game-market-coin&vs_currencies=eur,usd';
let lastFetch = 0;
let lastRates: any = null;
let lastError: string | null = null;

export function useCryptoRates() {
  const setCryptoRates = useCryptoRatesStore((s) => s.setCryptoRates);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    async function fetchRates() {
      const now = Date.now();
      if (lastRates && now - lastFetch < 30000) {
        setCryptoRates(lastRates);
        setError(lastError);
        return;
      }
      try {
        const res = await fetch(COINGECKO_URL);
        if (!res.ok) throw new Error('Erreur API CoinGecko');
        const data = await res.json();
        const rates = {
          ETH: { usd: data.ethereum?.usd || 0, eur: data.ethereum?.eur || 0 },
          BTC: { usd: data.bitcoin?.usd || 0, eur: data.bitcoin?.eur || 0 },
          SOL: { usd: data.solana?.usd || 0, eur: data.solana?.eur || 0 },
          XRP: { usd: data.ripple?.usd || 0, eur: data.ripple?.eur || 0 },
          LTC: { usd: data.litecoin?.usd || 0, eur: data.litecoin?.eur || 0 },
          TRX: { usd: data.tron?.usd || 0, eur: data.tron?.eur || 0 },
          GMC: { usd: data['game-market-coin']?.usd || 0, eur: data['game-market-coin']?.eur || 0 },
        };
        lastFetch = now;
        lastRates = rates;
        lastError = null;
        if (isMounted) {
          setCryptoRates(rates);
          setError(null);
        }
      } catch (e: any) {
        lastFetch = now;
        lastRates = lastRates || {
          ETH: { usd: 0, eur: 0 }, BTC: { usd: 0, eur: 0 }, SOL: { usd: 0, eur: 0 }, XRP: { usd: 0, eur: 0 }, LTC: { usd: 0, eur: 0 }, TRX: { usd: 0, eur: 0 }, GMC: { usd: 0, eur: 0 }
        };
        lastError = 'Erreur de récupération des taux crypto';
        if (isMounted) {
          setCryptoRates(lastRates);
          setError(lastError);
        }
      }
    }
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setCryptoRates]);
  return error;
} 