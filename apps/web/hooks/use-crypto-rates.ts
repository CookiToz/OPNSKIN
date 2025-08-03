'use client';
import { useEffect, useState } from 'react';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';

const COINGECKO_URL = '/api/crypto-prices';
let lastFetch = 0;
let lastRates: any = null;
let lastError: string | null = null;

export function useCryptoRates() {
  // CoinGecko désactivé temporairement
  return null;
} 