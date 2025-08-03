import { create } from 'zustand';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'RUB' | 'CNY' | 'ETH' | 'GMC' | 'BTC' | 'SOL' | 'XRP' | 'LTC' | 'TRX';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: 'EUR',
  setCurrency: (currency) => set({ currency }),
}));

// Store pour les taux crypto dynamiques
export type CryptoRate = { usd: number; eur: number };
interface CryptoRatesState {
  ETH: CryptoRate;
  GMC: CryptoRate;
  BTC: CryptoRate;
  SOL: CryptoRate;
  XRP: CryptoRate;
  LTC: CryptoRate;
  TRX: CryptoRate;
  setCryptoRates: (rates: Partial<CryptoRatesState>) => void;
}

export const useCryptoRatesStore = create<CryptoRatesState>((set) => ({
  ETH: { usd: 0, eur: 0 },
  GMC: { usd: 0, eur: 0 },
  BTC: { usd: 0, eur: 0 },
  SOL: { usd: 0, eur: 0 },
  XRP: { usd: 0, eur: 0 },
  LTC: { usd: 0, eur: 0 },
  TRX: { usd: 0, eur: 0 },
  setCryptoRates: (rates) => set(rates),
})); 