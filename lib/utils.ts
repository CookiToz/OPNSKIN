import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Currency, useCryptoRatesStore, CryptoRate } from '@/hooks/use-currency-store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cryptoIds: Record<Currency, string | null> = {
  EUR: null,
  USD: null,
  GBP: null,
  RUB: null,
  CNY: null,
  ETH: 'ethereum',
  GMC: null,
  BTC: 'bitcoin',
  SOL: 'solana',
  XRP: 'ripple',
  LTC: 'litecoin',
  TRX: 'tron',
};

export const cryptoIcons: Record<Currency, string | null> = {
  ETH: '/crypto/eth.svg',
  GMC: null,
  BTC: '/crypto/btc.svg',
  SOL: '/crypto/sol.svg',
  XRP: '/crypto/xrp.svg',
  LTC: '/crypto/ltc.svg',
  TRX: '/crypto/trx.svg',
  EUR: null,
  USD: null,
  GBP: null,
  RUB: null,
  CNY: null,
};

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  RUB: '₽',
  CNY: '¥',
  ETH: 'Ξ',
  GMC: 'GMC',
  BTC: '₿',
  SOL: '◎',
  XRP: '✕',
  LTC: 'Ł',
  TRX: 'TRX',
};

const currencyRates: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  RUB: 95,
  CNY: 7.8,
  ETH: 1,
  GMC: 1,
  BTC: 1,
  SOL: 1,
  XRP: 1,
  LTC: 1,
  TRX: 1,
};

const cryptoCurrencies = ['ETH', 'BTC', 'SOL', 'XRP', 'LTC', 'TRX'] as const;
type CryptoCurrency = typeof cryptoCurrencies[number];

export function formatPrice(amount: number, currency: Currency, cryptoRates?: Record<string, CryptoRate>): string {
  // All internal prices are in EUR
  let converted = amount;
  let symbol = currencySymbols[currency] || '';
  
  if (currency === 'EUR') {
    converted = amount;
  } else if (currency === 'USD') {
    // Convert EUR to USD (approximate rate)
    converted = amount * 1.08;
  } else if (['GBP', 'RUB', 'CNY'].includes(currency)) {
    // For other fiat currencies, use approximate rates
    if (currency === 'GBP') converted = amount * 0.85;
    else if (currency === 'RUB') converted = amount * 95;
    else if (currency === 'CNY') converted = amount * 7.8;
  } else if (cryptoRates && cryptoRates[currency]) {
    // For crypto, convert EUR to USD first, then to crypto
    const usdAmount = amount * 1.08; // EUR to USD
    const rate = cryptoRates[currency].usd;
    converted = rate > 0 ? usdAmount / rate : 0;
  }
  
  if (currency === 'ETH') return `Ξ${converted.toFixed(6)}`;
  if (currency === 'BTC') return `₿${converted.toFixed(6)}`;
  if (currency === 'SOL') return `◎${converted.toFixed(4)}`;
  if (currency === 'XRP') return `✕${converted.toFixed(2)}`;
  if (currency === 'LTC') return `Ł${converted.toFixed(4)}`;
  if (currency === 'TRX') return `TRX${converted.toFixed(2)}`;
  if (currency === 'USD') return `$${converted.toFixed(2)}`;
  if (currency === 'EUR') return `€${converted.toFixed(2)}`;
  return `${converted.toFixed(2)} ${symbol}`;
}

export function convertCurrency(amount: number, to: Currency, cryptoRates?: Record<string, CryptoRate>): number {
  // All internal prices are in USD
  if (to === 'USD') return amount;
  if (cryptoRates && cryptoRates[to]) {
    const rate = cryptoRates[to].usd;
    return rate > 0 ? amount / rate : 0;
  }
  // For fiat, fallback to USD
  return amount;
}
