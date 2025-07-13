"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { formatPrice } from '@/lib/utils';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import React from 'react';
import type { Currency } from '@/hooks/use-currency-store';

// Props génériques pour un skin/offre
export type SkinCardProps = {
  name: string;
  image: string;
  rarity?: string;
  rarityLabel?: string;
  price?: number;
  currency?: Currency;
  cryptoRates?: any;
  badge?: React.ReactNode;
  wear?: string;
  float?: number;
  statTrak?: boolean;
  isSellerOnline?: boolean;
  onDetails?: () => void;
  actionButton?: React.ReactNode;
  className?: string;
  last_seen?: string;
};

export default function SkinCard({
  name,
  image,
  rarity,
  rarityLabel,
  price,
  currency,
  cryptoRates,
  badge,
  wear,
  float,
  statTrak,
  isSellerOnline,
  onDetails,
  actionButton,
  className = '',
  last_seen,
}: SkinCardProps) {
  const { t } = useTranslation('common');
  const _currency = useCurrencyStore((s) => s.currency);
  const _cryptoRates = useCryptoRatesStore();
  const displayCurrency = currency || _currency;
  const displayCryptoRates = cryptoRates || _cryptoRates;
  const cryptoIcons: Record<string, string> = {
    EUR: '/crypto/eur.svg',
    USD: '/crypto/usd.svg',
    BTC: '/crypto/btc.svg',
    ETH: '/crypto/eth.svg',
    SOL: '/crypto/sol.svg',
    XRP: '/crypto/xrp.svg',
    LTC: '/crypto/ltc.svg',
    TRX: '/crypto/trx.svg',
    GMC: '/crypto/gmc.svg',
  };

  // Nettoyer le nom du skin pour ne pas afficher l'état d'usure
  const cleanName = name.replace(/\s*\(.*?\)\s*$/, '').trim();

  // DEBUG : log présence vendeur
  console.log('[SkinCard]', { name, isSellerOnline, last_seen });

  return (
    <Card className={`bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group flex flex-col justify-between min-h-[340px] ${className}`}>
      <style jsx global>{`
        @keyframes neonPulseOnline {
          0% { box-shadow: 0 0 4px 1px #00c97b, 0 0 1px 0px #00c97b; opacity: 1; }
          50% { box-shadow: 0 0 8px 2px #00c97b, 0 0 2px 1px #00c97b; opacity: 0.8; }
          100% { box-shadow: 0 0 4px 1px #00c97b, 0 0 1px 0px #00c97b; opacity: 1; }
        }
        @keyframes neonPulseOffline {
          0% { box-shadow: 0 0 4px 1px #ff3b3b, 0 0 1px 0px #ff3b3b; opacity: 1; }
          50% { box-shadow: 0 0 8px 2px #ff3b3b, 0 0 2px 1px #ff3b3b; opacity: 0.8; }
          100% { box-shadow: 0 0 4px 1px #ff3b3b, 0 0 1px 0px #ff3b3b; opacity: 1; }
        }
        .neon-online {
          background: #00c97b;
          box-shadow: 0 0 4px 1px #00c97b, 0 0 1px 0px #00c97b;
          animation: neonPulseOnline 2s infinite;
        }
        .neon-offline {
          background: #ff3b3b;
          box-shadow: 0 0 4px 1px #ff3b3b, 0 0 1px 0px #ff3b3b;
          animation: neonPulseOffline 2s infinite;
        }
      `}</style>
      <div className="relative flex-1 flex flex-col">
        {/* Présence vendeur néon animée */}
        {typeof isSellerOnline === 'boolean' && (
          <span
            className={`absolute top-3 left-3 z-20 w-3 h-3 rounded-full ${isSellerOnline ? 'neon-online' : 'neon-offline'}`}
            title={isSellerOnline ? t('marketplace.seller_online', 'Vendeur en ligne') : t('marketplace.seller_offline', 'Vendeur hors ligne')}
          />
        )}
        {/* Image */}
        <div className="w-full flex justify-center items-center aspect-square relative">
          <img
            src={image}
            alt={name}
            className="max-h-32 object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {/* Nom + badges */}
        <div className="flex items-center gap-2 mt-2 px-3">
          <h3 className="font-satoshi-bold text-base truncate text-opnskin-text-primary flex-1" title={cleanName}>{cleanName}</h3>
          {statTrak && (
            <Badge className="bg-orange-500/90 text-white border-orange-500/80 text-xs font-bold shadow">StatTrak™</Badge>
          )}
          {rarityLabel && (
            <Badge className="bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 text-xs ml-1">
              {rarityLabel}
            </Badge>
          )}
        </div>
        {/* État et float */}
        <div className="flex flex-col gap-1 mt-1 px-3">
          {wear && (
            <span className="text-xs text-opnskin-text-secondary italic">{t(wear)}</span>
          )}
          {typeof float === 'number' && !isNaN(float) && (
            <span className="text-xs text-gray-400 font-mono">Float: {float.toFixed(6)}</span>
          )}
        </div>
      </div>
      {/* Bas de card : prix + actions */}
      <CardContent className="pt-2 pb-3 px-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-opnskin-accent font-bold text-lg">
            {cryptoIcons[displayCurrency] && displayCurrency !== 'EUR' && displayCurrency !== 'USD' && (
              <img src={cryptoIcons[displayCurrency]!} alt={displayCurrency} className="inline w-5 h-5 mr-1 align-middle" />
            )}
            {price !== undefined ? formatPrice(price, displayCurrency, displayCryptoRates) : '--'}
          </span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {actionButton}
          {onDetails && (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 text-xs w-full"
              onClick={onDetails}
            >
              Détails
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 