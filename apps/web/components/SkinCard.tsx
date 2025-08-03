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
  lastSeenDiff?: number;
};

export default function SkinCard({
  name,
  image,
  rarity,
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
  lastSeenDiff,
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

  // Fonction pour déterminer la rareté à partir du nom du skin
  const getRarityFromName = (skinName: string): string => {
    // Si on a un rarityCode direct, l'utiliser en priorité
    if (rarity) {
      // Mapping des codes de rareté Steam vers nos clés
      const rarityCodeMap: Record<string, string> = {
        'rarity_common': 'consumer',
        'rarity_uncommon': 'industrial',
        'rarity_rare': 'milspec',
        'rarity_mythical': 'restricted',
        'rarity_legendary': 'classified',
        'rarity_ancient': 'covert',
        'rarity_immortal': 'exceedingly_rare',
        // Codes alternatifs possibles
        'Rarity_Common_Weapon': 'consumer',
        'Rarity_Uncommon_Weapon': 'industrial',
        'Rarity_Rare_Weapon': 'milspec',
        'Rarity_Mythical_Weapon': 'restricted',
        'Rarity_Legendary_Weapon': 'classified',
        'Rarity_Ancient_Weapon': 'covert',
        'Rarity_Immortal_Weapon': 'exceedingly_rare',
      };
      
      const mappedRarity = rarityCodeMap[rarity];
      if (mappedRarity) {
        return mappedRarity;
      }
    }
    
    // Fallback : analyse du nom du skin
    const nameLower = skinName.toLowerCase();
    
    // Mapping des raretés basé sur les noms de skins CS2
    // Skins extraordinaires (Contraband) - Or
    if (nameLower.includes('contraband') || nameLower.includes('gold') ||
        nameLower.includes('karambit') || nameLower.includes('m9 bayonet') ||
        nameLower.includes('dragon lore') || nameLower.includes('medusa')) {
      return 'exceedingly_rare';
    }
    
    // Skins secrets (Covert) - Rouge
    if (nameLower.includes('covert') || nameLower.includes('red') ||
        nameLower.includes('bloodsport') || nameLower.includes('fade') ||
        nameLower.includes('serpent') || nameLower.includes('howl') ||
        nameLower.includes('fire serpent')) {
      return 'covert';
    }
    
    // Skins classifiés (Classified) - Rose
    if (nameLower.includes('classified') || nameLower.includes('pink') ||
        nameLower.includes('asiimov') || nameLower.includes('hyper beast') ||
        nameLower.includes('neon rider') || nameLower.includes('printstream') ||
        nameLower.includes('temukau')) {
      return 'classified';
    }
    
    // Skins restreints (Restricted) - Violet
    if (nameLower.includes('restricted') || nameLower.includes('purple') ||
        nameLower.includes('tiger') || nameLower.includes('dragon') ||
        nameLower.includes('vulcan') || nameLower.includes('cyrex') ||
        nameLower.includes('guardian') || nameLower.includes('redline')) {
      return 'restricted';
    }
    
    // Skins militaires (Mil-Spec Grade) - Bleu
    if (nameLower.includes('mil-spec grade') || nameLower.includes('blue') ||
        nameLower.includes('urban') || nameLower.includes('forest') ||
        nameLower.includes('arctic') || nameLower.includes('boreal') ||
        nameLower.includes('dust') || nameLower.includes('bor') ||
        nameLower.includes('fubar')) {
      return 'milspec';
    }
    
    // Skins communs (Industrial Grade) - Bleu clair
    if (nameLower.includes('industrial grade') || nameLower.includes('light blue') ||
        nameLower.includes('vari camo') || nameLower.includes('jungle') ||
        nameLower.includes('forest ddpat') || nameLower.includes('sand dune') ||
        nameLower.includes('bamboo') || nameLower.includes('scorched')) {
      return 'industrial';
    }
    
    // Skins de base (Consumer Grade) - Gris
    if (nameLower.includes('consumer grade') || nameLower.includes('white') ||
        nameLower.includes('case') || nameLower.includes('dreams') ||
        nameLower.includes('nightmare')) {
      return 'consumer';
    }
    
    // Fallback par défaut
    return 'consumer';
  };

  // Fonction pour obtenir le nom d'affichage de la rareté
  const getRarityDisplayName = (rarityKey: string): string => {
    const rarityMap: Record<string, string> = {
      'consumer': t('rarity.consumer', 'Consommateur'),
      'industrial': t('rarity.industrial', 'Industriel'),
      'milspec': t('rarity.milspec', 'Militaire'),
      'restricted': t('rarity.restricted', 'Restreint'),
      'classified': t('rarity.classified', 'Classé'),
      'covert': t('rarity.covert', 'Secret'),
      'exceedingly_rare': t('rarity.exceedingly_rare', 'Extraordinaire'),
    };
    return rarityMap[rarityKey] || rarityKey;
  };

  // Fonction pour obtenir la classe CSS du badge de rareté
  const getRarityBadgeClass = (rarityKey: string): string => {
    const badgeClasses: Record<string, string> = {
      'consumer': 'bg-gray-400/90 text-white border-gray-400/80',
      'industrial': 'bg-blue-400/90 text-white border-blue-400/80',
      'milspec': 'bg-blue-500/90 text-white border-blue-500/80',
      'restricted': 'bg-purple-500/90 text-white border-purple-500/80',
      'classified': 'bg-pink-500/90 text-white border-pink-500/80',
      'covert': 'bg-red-500/90 text-white border-red-500/80',
      'exceedingly_rare': 'bg-yellow-500/90 text-black border-yellow-500/80',
    };
    return badgeClasses[rarityKey] || 'bg-gray-400/90 text-white border-gray-400/80';
  };

  const currentRarity = getRarityFromName(name);

  // DEBUG : log présence vendeur
  console.log('[SkinCard]', { name, isSellerOnline, last_seen, lastSeenDiff, rarity: currentRarity });

  return (
    <Card className={`bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group flex flex-col justify-between min-h-[180px] p-1.5 ${className}`}>
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
            className={`absolute top-1.5 left-1.5 z-20 w-2 h-2 rounded-full ${isSellerOnline ? 'neon-online' : 'neon-offline'}`}
            title={isSellerOnline ? t('marketplace.seller_online', 'Vendeur en ligne') : t('marketplace.seller_offline', 'Vendeur hors ligne')}
          />
        )}
        {/* DEBUG : différence de temps */}
        {/* (supprimé) {typeof lastSeenDiff === 'number' && (
          <span style={{ color: isSellerOnline ? 'green' : 'red', fontSize: 10, position: 'absolute', top: 8, left: 20 }}>
            {lastSeenDiff} ms
          </span>
        )} */}
        {/* Image */}
        <div className="w-full flex justify-center items-center aspect-square relative">
          <img
            src={image}
            alt={name}
            className="max-h-28 object-contain p-0.5 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {/* Nom + badges */}
        <div className="flex items-center gap-0.5 mt-0.5 px-1.5">
          <h3 className="font-satoshi-bold text-[13px] truncate text-opnskin-text-primary flex-1 leading-tight" title={cleanName}>{cleanName}</h3>
          {statTrak && (
            <Badge className="bg-orange-500/90 text-white border-orange-500/80 text-[9px] font-bold shadow">StatTrak™</Badge>
          )}
        </div>
        
        {/* Badge de rareté en haut à droite de l'image */}
        <div className="absolute top-1.5 right-1.5 z-20">
          <Badge className={`text-[8px] font-bold shadow ${getRarityBadgeClass(currentRarity)}`}>
            {getRarityDisplayName(currentRarity)}
          </Badge>
        </div>
        {/* État et float */}
        <div className="flex flex-col gap-0 mt-0.5 px-1.5">
          {wear && (
            <span className="text-[10px] text-opnskin-text-secondary italic leading-tight">{t(wear)}</span>
          )}
          {typeof float === 'number' && !isNaN(float) && (
            <span className="text-[10px] text-gray-400 font-mono leading-tight">Float: {float.toFixed(6)}</span>
          )}
        </div>
      </div>
      {/* Bas de card : prix + actions */}
      <CardContent className="pt-1 pb-1 px-1.5 flex flex-col gap-0.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-mono text-opnskin-accent font-bold text-[15px]">
            {cryptoIcons[displayCurrency] && displayCurrency !== 'EUR' && displayCurrency !== 'USD' && (
              <img src={cryptoIcons[displayCurrency]!} alt={displayCurrency} className="inline w-4 h-4 mr-1 align-middle" />
            )}
            {price !== undefined ? formatPrice(price, displayCurrency, displayCryptoRates) : '--'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 w-full">
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