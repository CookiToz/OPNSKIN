'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Loading, GridLoading } from '@/components/ui/loading';

interface PopularSkin {
  id: string;
  itemName: string;
  itemImage: string;
  price: number;
  game: string;
  rarityCode?: string;
  status: string;
  createdAt: string;
}

interface PopularSkinsProps {
  limit?: number;
}

export default function PopularSkins({ limit = 8 }: PopularSkinsProps) {
  const { t, ready } = useTranslation('common');
  const { currency } = useCurrencyStore();
  const cryptoRates = useCryptoRatesStore();
  const [skins, setSkins] = useState<PopularSkin[]>([]);
  const [loading, setLoading] = useState(false); // Changé à false par défaut
  const [error, setError] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState('730'); // CS2 par défaut
  const [hasLoaded, setHasLoaded] = useState(false);

  const gameConfigs = {
    '730': { name: 'CS2', key: 'cs2' },
    '570': { name: 'Dota 2', key: 'dota2' },
    '252490': { name: 'Rust', key: 'rust' },
    '440': { name: 'TF2', key: 'tf2' },
  };

  const fetchPopularSkins = async (game: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[POPULAR SKINS] Fetching popular skins for game: ${game}`);
      
      const response = await fetch(`/api/offers/popular?game=${game}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch popular skins');
      }
      
      const data = await response.json();
      console.log(`[POPULAR SKINS] Received ${data.length} skins for ${game}`);
      
      setSkins(data);
      setHasLoaded(true);
    } catch (err: any) {
      console.error('[POPULAR SKINS] Error:', err);
      setError(err.message || 'Erreur lors du chargement des skins populaires');
      setSkins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && !hasLoaded) {
      fetchPopularSkins(activeGame);
    }
  }, [ready, activeGame, limit, hasLoaded]);

  const handleGameChange = (gameKey: string) => {
    const gameId = Object.entries(gameConfigs).find(([_, config]) => config.key === gameKey)?.[0] || '730';
    setActiveGame(gameId);
  };

  const getRarityBadge = (rarityCode?: string) => {
    if (!rarityCode) return null;
    
    const rarityMap: Record<string, { label: string; className: string }> = {
      'rarity_ancient': { label: t('home.badge_ancient'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      'rarity_legendary': { label: t('home.badge_legendary'), className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      'rarity_mythical': { label: t('home.badge_mythic'), className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      'rarity_rare': { label: t('home.badge_rare'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      'rarity_uncommon': { label: t('home.badge_uncommon'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      'rarity_common': { label: t('home.badge_common'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    };
    
    const rarity = rarityMap[rarityCode] || rarityMap['rarity_common'];
    return <Badge className={`absolute top-2 right-2 z-20 text-xs ${rarity.className}`}>{rarity.label}</Badge>;
  };

  if (!ready) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="container px-2 md:px-4">
        {/* Titre Skins populaires */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-satoshi-bold mb-4 md:mb-0">
            {t('home.popular_title_1')} <span className="neon-text">{t('home.popular_title_2')}</span>
          </h2>
        </div>

        <Tabs defaultValue="cs2" className="w-full md:w-auto" onValueChange={handleGameChange}>
          <TabsList className="bg-opnskin-bg-secondary border border-opnskin-bg-secondary flex flex-wrap md:flex-nowrap">
            <TabsTrigger
              value="cs2"
              className="data-[state=active]:bg-opnskin-primary/20 data-[state=active]:text-opnskin-primary"
            >
              CS2
            </TabsTrigger>
            <TabsTrigger
              value="dota2"
              className="data-[state=active]:bg-opnskin-primary/20 data-[state=active]:text-opnskin-primary"
            >
              Dota 2
            </TabsTrigger>
            <TabsTrigger
              value="rust"
              className="data-[state=active]:bg-opnskin-primary/20 data-[state=active]:text-opnskin-primary"
            >
              Rust
            </TabsTrigger>
            <TabsTrigger
              value="tf2"
              className="data-[state=active]:bg-opnskin-primary/20 data-[state=active]:text-opnskin-primary"
            >
              TF2
            </TabsTrigger>
          </TabsList>

          {Object.entries(gameConfigs).map(([gameId, config]) => (
            <TabsContent key={config.key} value={config.key} className="mt-4 md:mt-6">
              {loading ? (
                <div className="py-12">
                  <GridLoading count={8} />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-red-400 font-semibold mb-2">Erreur de chargement</h3>
                    <p className="text-opnskin-text-secondary mb-4">{error}</p>
                    <Button onClick={() => fetchPopularSkins(activeGame)} variant="outline" size="sm">
                      Réessayer
                    </Button>
                  </div>
                </div>
              ) : skins.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-opnskin-bg-secondary/50 border border-opnskin-bg-secondary rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-opnskin-text-secondary font-semibold mb-2">
                      Aucun skin disponible
                    </h3>
                    <p className="text-opnskin-text-secondary text-sm">
                      Aucun skin populaire disponible pour {config.name} pour le moment.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto px-0 md:px-4">
                  {skins.map((skin) => (
                    <Card key={skin.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group">
                      <div className="aspect-square relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-opnskin-bg-card/80 z-10"></div>
                        <img
                          src={skin.itemImage || '/placeholder.svg'}
                          alt={skin.itemName}
                          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {getRarityBadge(skin.rarityCode)}
                        <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
                          <h3 className="font-satoshi-bold text-sm truncate text-opnskin-text-primary mb-1">
                            {skin.itemName}
                          </h3>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-opnskin-text-secondary">
                            {new Date(skin.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-mono text-opnskin-accent font-bold text-sm">
                            {cryptoIcons[currency] && currency !== 'EUR' && currency !== 'USD' && (
                              <img src={cryptoIcons[currency]!} alt={currency} className="inline w-4 h-4 mr-1 align-middle" />
                            )}
                            {formatPrice(skin.price, currency, {
                              ETH: cryptoRates.ETH,
                              BTC: cryptoRates.BTC,
                              SOL: cryptoRates.SOL,
                              XRP: cryptoRates.XRP,
                              LTC: cryptoRates.LTC,
                              TRX: cryptoRates.TRX,
                              GMC: cryptoRates.GMC,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <Button size="sm" className="btn-opnskin-secondary flex-1 text-xs" asChild>
                            <Link href={`/marketplace?game=${config.key}`}>
                              {t('home.go_to_marketplace')}
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 text-xs" asChild>
                            <Link href={`/marketplace/${config.key}/${skin.id}`}>
                              {t('home.details')}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
} 