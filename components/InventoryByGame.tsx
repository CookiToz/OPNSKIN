'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'next-i18next';
import { useInventory } from "@/components/InventoryProvider";
import { useFloat } from "@/components/FloatProvider";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Tag, ExternalLink, Filter, X } from 'lucide-react';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { useSearchStore } from '@/hooks/use-search-store';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export type GameType = {
  key: string;
  name: string;
  cover: string;
  appid: number;
};

type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  marketPrice?: number;
  rarityCode?: string;
};

type InventoryByGameProps = {
  game: GameType;
  onBack?: () => void;
};

// Mapping des codes de rareté vers les clés de traduction
const rarityKeyMap: Record<string, string> = {
  'Rarity_Common_Weapon': 'rarity_consumer',
  'Rarity_Uncommon_Weapon': 'rarity_industrial',
  'Rarity_Rare_Weapon': 'rarity_milspec',
  'Rarity_Mythical_Weapon': 'rarity_restricted',
  'Rarity_Legendary_Weapon': 'rarity_classified',
  'Rarity_Ancient_Weapon': 'rarity_covert',
  'Rarity_Immortal_Weapon': 'rarity_exceedingly_rare',
};

// Fonction pour extraire l'état de l'arme du nom
const getWeaponWear = (name: string): string => {
  if (name.includes('Factory New')) return 'wear_factory_new';
  if (name.includes('Minimal Wear')) return 'wear_minimal_wear';
  if (name.includes('Field-Tested')) return 'wear_field_tested';
  if (name.includes('Well-Worn')) return 'wear_well_worn';
  if (name.includes('Battle-Scarred')) return 'wear_battle_scarred';
  return '';
};

// Fonction pour extraire la catégorie d'arme du nom
const getWeaponCategory = (name: string): string => {
  const weaponTypes = {
    'AK': 'AK-47',
    'M4A1': 'M4A1',
    'M4A4': 'M4A4',
    'AWP': 'AWP',
    'Glock': 'Glock',
    'USP': 'USP',
    'P250': 'P250',
    'Deagle': 'Desert Eagle',
    'MP7': 'MP7',
    'P90': 'P90',
    'Nova': 'Nova',
    'XM1014': 'XM1014',
    'MAG': 'MAG-7',
    'Negev': 'Negev',
  };
  
  for (const [key, value] of Object.entries(weaponTypes)) {
    if (name.includes(key)) return value;
  }
  return 'Arme';
};

export default function InventoryByGame({ game, onBack }: InventoryByGameProps) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [hasRequestedLoad, setHasRequestedLoad] = useState(false);
  const { items, isLoading, isError, errorMsg, refetch } = useInventory(hasRequestedLoad ? (game?.appid ? String(game.appid) : undefined) : undefined);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  
  // États pour les filtres
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [priceMinFilter, setPriceMinFilter] = useState<string>('');
  const [priceMaxFilter, setPriceMaxFilter] = useState<string>('');
  const [weaponFilter, setWeaponFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const currency = useCurrencyStore((s) => s.currency);
  const cryptoRates = useCryptoRatesStore((s) => s);
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
  
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const { user } = useUser();
  const [listedItemIds, setListedItemIds] = useState<string[]>([]);

  useEffect(() => {
    // Récupérer les itemId des offres actives de l'utilisateur
    if (user && user.loggedIn) {
      fetch('/api/offers?mine=true')
        .then(res => res.json())
        .then(data => {
          const ids = (data.offers || [])
            .filter((offer: any) => offer.sellerId === user.id && offer.status === 'AVAILABLE')
            .map((offer: any) => offer.itemId);
          setListedItemIds(ids);
        });
    } else {
      setListedItemIds([]);
    }
  }, [user]);

  const handleBack = () => {
    localStorage.removeItem('opnskin-inventory-game');
    if (onBack) onBack();
  };

  const handleRefreshInventory = () => {
    setHasRequestedLoad(true);
    refetch();
  };

  const handleSell = (item: InventoryItem) => {
    setSelectedItem(item);
    setSellPrice(item.marketPrice ? item.marketPrice.toString() : '');
    setSellDialogOpen(true);
  };

  const handleSellConfirm = async () => {
    if (!selectedItem || !sellPrice) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un prix valide.",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(sellPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Erreur",
        description: "Le prix doit être un nombre positif.",
        variant: "destructive",
      });
      return;
    }

    setIsSelling(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          itemImage: selectedItem.icon,
          game: game.key,
          price: price,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Offre créée !",
          description: `${selectedItem.name} a été mis en vente pour ${formatPrice(price, currency, {
            ETH: cryptoRates.ETH,
            BTC: cryptoRates.BTC,
            SOL: cryptoRates.SOL,
            XRP: cryptoRates.XRP,
            LTC: cryptoRates.LTC,
            TRX: cryptoRates.TRX,
            GMC: cryptoRates.GMC,
          })}.`,
        });
        
        // Fermer la modal et réinitialiser
        setSellDialogOpen(false);
        setSelectedItem(null);
        setSellPrice('');
        
        refetch(); // Recharge l'inventaire pour masquer l'item vendu
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de créer l'offre.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      toast({
        title: "Erreur réseau",
        description: "Vérifiez votre connexion et réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsSelling(false);
    }
  };

  const handleDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  // Logique de filtrage
  const filteredItems = items.filter(item => {
    // Exclure les items déjà listés en vente par l'utilisateur
    if (listedItemIds.includes(item.id)) return false;
    // Filtre de base : exclure les skins de faible valeur (< 0.02€)
    if (item.marketPrice !== undefined && item.marketPrice < 0.02) {
      return false;
    }
    // Filtre par recherche (nom)
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Filtre par rareté
    if (rarityFilter !== 'all') {
      const itemRarity = item.rarityCode ? rarityKeyMap[item.rarityCode] : null;
      if (itemRarity !== rarityFilter) {
        return false;
      }
    }
    // Filtre par prix minimum
    if (priceMinFilter && item.marketPrice !== undefined) {
      const minPrice = parseFloat(priceMinFilter);
      if (item.marketPrice < minPrice) {
        return false;
      }
    }
    // Filtre par prix maximum
    if (priceMaxFilter && item.marketPrice !== undefined) {
      const maxPrice = parseFloat(priceMaxFilter);
      if (item.marketPrice > maxPrice) {
        return false;
      }
    }
    // Filtre par catégorie d'arme
    if (weaponFilter !== 'all') {
      const itemWeapon = getWeaponCategory(item.name);
      if (itemWeapon !== weaponFilter) {
        return false;
      }
    }
    return true;
  });
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setRarityFilter('all');
    setPriceMinFilter('');
    setPriceMaxFilter('');
    setWeaponFilter('all');
  };
  
  // Vérifier si des filtres sont actifs
  const hasActiveFilters = rarityFilter !== 'all' || priceMinFilter || priceMaxFilter || weaponFilter !== 'all';

  return (
    <div className="flex flex-col items-center py-8 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button onClick={handleBack} className="text-white font-bold text-3xl mr-2 hover:text-[#00ffe7] transition-colors duration-200" aria-label={t('inventory.back', 'Retour à la sélection du jeu')}>←</button>
        )}
        <h2 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-tight text-opnskin-primary drop-shadow-lg">
          {t('inventory.title', 'Inventaire')} {t(`marketplace.game_${game.key}`, game.name)}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant={hasActiveFilters ? "default" : "outline"}
            className={`flex items-center gap-2 ${hasActiveFilters ? 'bg-opnskin-accent text-black' : 'border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10'}`}
          >
            <Filter className="w-4 h-4" />
            {t('inventory.filters', 'Filtres')}
            {hasActiveFilters && <Badge className="ml-1 bg-black/20 text-black text-xs">Actif</Badge>}
          </Button>
          <Button 
            onClick={handleRefreshInventory}
            disabled={isLoading}
            className="btn-opnskin-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('inventory.refresh', 'Actualiser')}
          </Button>
        </div>
      </div>

      {!hasRequestedLoad ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-text-secondary text-lg font-rajdhani text-center">
            {t('inventory.click_to_load', 'Cliquez sur "Actualiser" pour charger l\'inventaire {{gameName}}', { gameName: t(`marketplace.game_${game.key}`, game.name) })}
          </div>
          <Button 
            onClick={handleRefreshInventory}
            className="btn-opnskin flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('inventory.load_inventory', 'Charger l\'inventaire')}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-primary text-xl font-rajdhani animate-pulse">
            {t('inventory.loading', "Chargement de l'inventaire…")}
          </div>
          {onBack && (
            <button 
              onClick={onBack} 
              className="btn-opnskin-secondary flex items-center gap-2"
            >
              ← {t('inventory.back_to_games', 'Retour aux jeux')}
            </button>
          )}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-red-500 text-lg font-bold text-center">
            {errorMsg || t('inventory.error_loading', "Erreur lors du chargement de l'inventaire")}
          </div>
          <div className="text-opnskin-text-secondary text-sm text-center max-w-md">
            {errorMsg?.includes('privé') && (
              <p>Votre inventaire Steam est privé. Allez dans les paramètres de votre profil Steam et rendez votre inventaire public.</p>
            )}
            {errorMsg?.includes('404') && (
              <p>Vous n'avez pas d'inventaire pour ce jeu ou votre profil Steam n'est pas accessible.</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleRefreshInventory} className="btn-opnskin">
              {t('inventory.retry')}
            </Button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="btn-opnskin-secondary flex items-center gap-2"
              >
                ← {t('inventory.back_to_games', 'Retour aux jeux')}
              </button>
            )}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-text-secondary text-lg font-rajdhani text-center">
            {t('inventory.empty_game', 'L\'inventaire {{gameName}} est vide', { gameName: t(`marketplace.game_${game.key}`, game.name) })}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleRefreshInventory} className="btn-opnskin-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('inventory.refresh', 'Actualiser')}
            </Button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="btn-opnskin-secondary flex items-center gap-2"
              >
                ← {t('inventory.back_to_games', 'Retour aux jeux')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Panneau de filtres */}
          {showFilters && (
            <div className="w-full max-w-6xl mx-auto px-4 mb-6">
              <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-satoshi-bold text-opnskin-text-primary">
                      {t('inventory.filter_title', 'Filtres')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={resetFilters}
                        variant="outline" 
                        size="sm"
                        className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
                      >
                        <X className="w-3 h-3 mr-1" />
                        {t('inventory.reset_filters', 'Réinitialiser')}
                      </Button>
                      <Button 
                        onClick={() => setShowFilters(false)}
                        variant="outline" 
                        size="sm"
                        className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
                      >
                        {t('inventory.close_filters', 'Fermer')}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtre par rareté */}
                    <div className="space-y-2">
                      <Label className="text-opnskin-text-primary text-sm">
                        {t('inventory.rarity_filter', 'Rareté')}
                      </Label>
                      <Select value={rarityFilter} onValueChange={setRarityFilter}>
                        <SelectTrigger className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary">
                          <SelectValue placeholder={t('inventory.select_rarity', 'Sélectionner une rareté')} />
                        </SelectTrigger>
                        <SelectContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
                          <SelectItem value="all">{t('inventory.all_rarities', 'Toutes les raretés')}</SelectItem>
                          <SelectItem value="rarity_consumer">{t('inventory.rarity_consumer')}</SelectItem>
                          <SelectItem value="rarity_industrial">{t('inventory.rarity_industrial')}</SelectItem>
                          <SelectItem value="rarity_milspec">{t('inventory.rarity_milspec')}</SelectItem>
                          <SelectItem value="rarity_restricted">{t('inventory.rarity_restricted')}</SelectItem>
                          <SelectItem value="rarity_classified">{t('inventory.rarity_classified')}</SelectItem>
                          <SelectItem value="rarity_covert">{t('inventory.rarity_covert')}</SelectItem>
                          <SelectItem value="rarity_exceedingly_rare">{t('inventory.rarity_exceedingly_rare')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Filtre par catégorie d'arme */}
                    <div className="space-y-2">
                      <Label className="text-opnskin-text-primary text-sm">
                        {t('inventory.weapon_filter', 'Catégorie d\'arme')}
                      </Label>
                      <Select value={weaponFilter} onValueChange={setWeaponFilter}>
                        <SelectTrigger className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary">
                          <SelectValue placeholder={t('inventory.select_weapon', 'Sélectionner une arme')} />
                        </SelectTrigger>
                        <SelectContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
                          <SelectItem value="all">{t('inventory.all_weapons', 'Toutes les armes')}</SelectItem>
                          <SelectItem value="AK-47">AK-47</SelectItem>
                          <SelectItem value="M4A1">M4A1</SelectItem>
                          <SelectItem value="M4A4">M4A4</SelectItem>
                          <SelectItem value="AWP">AWP</SelectItem>
                          <SelectItem value="Glock">Glock</SelectItem>
                          <SelectItem value="USP">USP</SelectItem>
                          <SelectItem value="P250">P250</SelectItem>
                          <SelectItem value="Desert Eagle">Desert Eagle</SelectItem>
                          <SelectItem value="MP7">MP7</SelectItem>
                          <SelectItem value="P90">P90</SelectItem>
                          <SelectItem value="Nova">Nova</SelectItem>
                          <SelectItem value="XM1014">XM1014</SelectItem>
                          <SelectItem value="MAG-7">MAG-7</SelectItem>
                          <SelectItem value="Negev">Negev</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Filtre par prix minimum */}
                    <div className="space-y-2">
                      <Label className="text-opnskin-text-primary text-sm">
                        {t('inventory.min_price', 'Prix minimum (€)')}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceMinFilter}
                        onChange={(e) => setPriceMinFilter(e.target.value)}
                        placeholder="0.00"
                        className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                      />
                    </div>
                    
                    {/* Filtre par prix maximum */}
                    <div className="space-y-2">
                      <Label className="text-opnskin-text-primary text-sm">
                        {t('inventory.max_price', 'Prix maximum (€)')}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceMaxFilter}
                        onChange={(e) => setPriceMaxFilter(e.target.value)}
                        placeholder="1000.00"
                        className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
                      />
                    </div>
                  </div>
                  
                  {/* Statistiques des filtres */}
                  <div className="mt-4 pt-4 border-t border-opnskin-bg-secondary">
                    <div className="flex items-center justify-between text-sm text-opnskin-text-secondary">
                      <span>
                        {t('inventory.items_showing', '{{count}} objets affichés sur {{total}}', { 
                          count: filteredItems.length, 
                          total: items.filter(item => item.marketPrice === undefined || item.marketPrice >= 0.02).length 
                        })}
                      </span>
                      {hasActiveFilters && (
                        <span className="text-opnskin-accent">
                          {t('inventory.filters_active', 'Filtres actifs')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl mx-auto px-4">
            {filteredItems.map(item => {
              const rarity = item.rarityCode ? rarityKeyMap[item.rarityCode] : null;
              const weaponCategory = getWeaponCategory(item.name);
              const weaponWear = getWeaponWear(item.name);
              
              return (
                <Card key={item.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group">
                  <div className="aspect-square relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-opnskin-bg-card/80 z-10"></div>
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                    {rarity && (
                      <Badge className="absolute top-2 right-2 z-20 bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 text-xs">
                        {t(`inventory.${rarity}`)}
                      </Badge>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
                      <h3 className="font-satoshi-bold text-sm truncate text-opnskin-text-primary mb-1">{item.name}</h3>
                      {weaponWear && (
                        <p className="text-xs text-opnskin-text-secondary italic">
                          {t(`inventory.${weaponWear}`)}
                        </p>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      {item.marketPrice !== undefined && (
                        <span className="font-mono text-opnskin-accent font-bold text-sm">
                          {cryptoIcons[currency] && currency !== 'EUR' && currency !== 'USD' && (
                            <img src={cryptoIcons[currency]!} alt={currency} className="inline w-4 h-4 mr-1 align-middle" />
                          )}
                          {formatPrice(item.marketPrice, currency, {
                            ETH: cryptoRates.ETH,
                            BTC: cryptoRates.BTC,
                            SOL: cryptoRates.SOL,
                            XRP: cryptoRates.XRP,
                            LTC: cryptoRates.LTC,
                            TRX: cryptoRates.TRX,
                            GMC: cryptoRates.GMC,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <Button 
                        size="sm" 
                        className="btn-opnskin-secondary flex-1 text-xs" 
                        onClick={() => handleSell(item)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {t('inventory.sell', 'Vendre')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 text-xs"
                        onClick={() => handleDetails(item)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de vente */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
          <DialogHeader>
            <DialogTitle className="text-opnskin-text-primary">
              {t('inventory.sell_skin', 'Vendre {{skinName}}', { skinName: selectedItem?.name })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={selectedItem?.icon} alt={selectedItem?.name} className="w-16 h-16 object-contain" />
              <div>
                <h3 className="font-satoshi-bold text-opnskin-text-primary">{selectedItem?.name}</h3>
                <p className="text-opnskin-text-secondary text-sm">
                  {t('inventory.market_price', 'Prix du marché: {{price}}', { 
                    price: selectedItem?.marketPrice !== undefined 
                      ? formatPrice(selectedItem.marketPrice, currency, {
                          ETH: cryptoRates.ETH,
                          BTC: cryptoRates.BTC,
                          SOL: cryptoRates.SOL,
                          XRP: cryptoRates.XRP,
                          LTC: cryptoRates.LTC,
                          TRX: cryptoRates.TRX,
                          GMC: cryptoRates.GMC,
                        })
                      : 'N/A'
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-price" className="text-opnskin-text-primary">
                {t('inventory.sell_price', 'Prix de vente')}
              </Label>
              <Input
                id="sell-price"
                type="number"
                step="0.01"
                min="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder={t('inventory.enter_price', 'Entrez votre prix')}
                className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSellConfirm} className="btn-opnskin flex-1" disabled={isSelling}>
                {isSelling ? t('inventory.selling', 'Vente en cours...') : t('inventory.confirm_sale', 'Confirmer la vente')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSellDialogOpen(false)}
                className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
              >
                {t('inventory.cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-opnskin-bg-card border-opnskin-bg-secondary max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-opnskin-text-primary">
              {t('inventory.skin_details', 'Détails du skin')}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <img src={selectedItem.icon} alt={selectedItem.name} className="w-32 h-32 object-contain" />
                <div className="flex-1">
                  <h3 className="font-satoshi-bold text-xl text-opnskin-text-primary mb-2">{selectedItem.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-opnskin-text-secondary">
                        {t('inventory.category', 'Catégorie:')}
                      </span>
                      <span className="text-opnskin-text-primary">{getWeaponCategory(selectedItem.name)}</span>
                    </div>
                    {getWeaponWear(selectedItem.name) && (
                      <div className="flex justify-between">
                        <span className="text-opnskin-text-secondary">
                          {t('inventory.wear', 'État:')}
                        </span>
                        <span className="text-opnskin-text-primary italic">
                          {t(`inventory.${getWeaponWear(selectedItem.name)}`)}
                        </span>
                      </div>
                    )}
                    {selectedItem.marketPrice !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-opnskin-text-secondary">
                          {t('inventory.market_price', 'Prix du marché:')}
                        </span>
                        <span className="text-opnskin-accent font-mono font-bold">
                          {formatPrice(selectedItem.marketPrice, currency, {
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
                    )}
                    {selectedItem.rarityCode && rarityKeyMap[selectedItem.rarityCode] && (
                      <div className="flex justify-between">
                        <span className="text-opnskin-text-secondary">
                          {t('inventory.rarity', 'Rareté:')}
                        </span>
                        <Badge className="bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 text-xs">
                          {t(`inventory.${rarityKeyMap[selectedItem.rarityCode]}`)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Section Float */}
              <div className="border-t border-opnskin-bg-secondary pt-4">
                <h4 className="font-satoshi-bold text-lg text-opnskin-text-primary mb-3">
                  {t('inventory.float_info', 'Informations Float')}
                </h4>
                <SkinFloatDetails itemId={selectedItem.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant pour afficher les détails du float
function SkinFloatDetails({ itemId }: { itemId: string }) {
  const { t } = useTranslation('common');
  const floatState = useFloat(itemId);
  const [showFloat, setShowFloat] = useState(false);

  return (
    <div className="space-y-3">
      {!showFloat ? (
        <Button 
          onClick={() => setShowFloat(true)} 
          className="btn-opnskin-secondary"
        >
          {t('inventory.load_float_info', 'Charger les informations Float')}
        </Button>
      ) : (
        <div className="space-y-2">
          {floatState.isLoading ? (
            <div className="text-opnskin-primary animate-pulse">
              {t('inventory.loading_float', 'Chargement des informations Float…')}
            </div>
          ) : floatState.isError ? (
            <div className="text-red-500">
              {t('inventory.float_error', 'Erreur: {{error}}', { error: floatState.errorMsg || 'Impossible de récupérer les informations Float' })}
            </div>
          ) : floatState.data?.float !== null ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-opnskin-text-secondary">
                  {t('inventory.float_value', 'Float:')}
                </span>
                <span className="text-opnskin-accent font-mono font-bold">{floatState.data?.float}</span>
              </div>
              {floatState.data?.csfloatLink && (
                <div className="flex justify-between">
                  <span className="text-opnskin-text-secondary">
                    {t('inventory.csfloat_link', 'Lien CSFloat:')}
                  </span>
                  <a 
                    href={floatState.data.csfloatLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-opnskin-primary hover:text-opnskin-primary-hover underline"
                  >
                    {t('inventory.view_on_csfloat', 'Voir sur CSFloat')}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-opnskin-text-secondary">
              {t('inventory.no_float_info', 'Aucune information Float disponible')}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 