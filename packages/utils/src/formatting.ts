import { Currency, CryptoRate } from '@opnskin/types';

/**
 * Formate un prix avec la devise appropriée
 */
export const formatPrice = (
  price: number, 
  currency: Currency, 
  cryptoRates?: CryptoRate
): string => {
  if (!price || price <= 0) return '0.00 €';

  // Pour les cryptomonnaies
  if (['ETH', 'BTC', 'SOL', 'XRP', 'LTC', 'TRX'].includes(currency)) {
    const rate = cryptoRates?.[currency];
    if (rate && rate > 0) {
      const eurValue = price * rate;
      return `${price.toFixed(4)} ${currency} (${eurValue.toFixed(2)} €)`;
    }
    return `${price.toFixed(4)} ${currency}`;
  }

  // Pour les devises fiat
  const symbols: Record<Currency, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    RUB: '₽',
    CNY: '¥',
    ETH: 'ETH',
    BTC: 'BTC',
    SOL: 'SOL',
    XRP: 'XRP',
    LTC: 'LTC',
    TRX: 'TRX',
  };

  const symbol = symbols[currency] || '€';
  return `${price.toFixed(2)} ${symbol}`;
};

/**
 * Formate un nombre avec des séparateurs de milliers
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formate une date en français
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formate un temps relatif (ex: "il y a 2 heures")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'à l\'instant';
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)}j`;
  
  return formatDate(date);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}; 