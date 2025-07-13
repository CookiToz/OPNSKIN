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

  return (
    <Card className={`bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group ${className}`}>
      <div className="aspect-square relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-opnskin-bg-card/80 z-10"></div>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Marqueur de présence en ligne du vendeur */}
        {typeof isSellerOnline === 'boolean' && (
          <span
            className={`absolute top-2 left-2 z-20 w-3 h-3 rounded-full border-2 border-white ${isSellerOnline ? 'bg-green-500' : 'bg-gray-400'}`}
            title={isSellerOnline ? t('marketplace.seller_online', 'Vendeur en ligne') : t('marketplace.seller_offline', 'Vendeur hors ligne')}
          />
        )}
        {/* Badge StatTrak */}
        {statTrak && (
          <Badge className="absolute top-2 left-8 z-20 bg-orange-500/90 text-white border-orange-500/80 text-xs font-bold shadow">StatTrak™</Badge>
        )}
        {rarityLabel && (
          <Badge className="absolute top-2 right-2 z-20 bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 text-xs">
            {rarityLabel}
          </Badge>
        )}
        {badge}
        <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
          <h3 className="font-satoshi-bold text-sm truncate text-opnskin-text-primary mb-1">{name}</h3>
          {wear && (
            <p className="text-xs text-opnskin-text-secondary italic">
              {t(`inventory.${wear}`)}
            </p>
          )}
          {/* Affichage du float si dispo */}
          {typeof float === 'number' && !isNaN(float) && (
            <p className="text-xs text-opnskin-accent font-mono">Float: {float}</p>
          )}
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          {price !== undefined && (
            <span className="font-mono text-opnskin-accent font-bold text-sm">
              {cryptoIcons[displayCurrency] && displayCurrency !== 'EUR' && displayCurrency !== 'USD' && (
                <img src={cryptoIcons[displayCurrency]!} alt={displayCurrency} className="inline w-4 h-4 mr-1 align-middle" />
              )}
              {formatPrice(price, displayCurrency, displayCryptoRates)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-2">
          {actionButton}
          {onDetails && (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 text-xs"
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