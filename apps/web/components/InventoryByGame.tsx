'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useInventory } from "@/hooks/use-inventory";
import { useFloat } from "@/components/FloatProvider";
import SkinCard from '@/components/SkinCard';
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Tag, ExternalLink, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { useSearchStore } from '@/hooks/use-search-store';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/components/UserProvider';

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
  // Démarrer automatiquement: on charge depuis la DB/cache au montage
  const [hasRequestedLoad, setHasRequestedLoad] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  
  // Utiliser le nouveau hook optimisé
  const { 
    items, 
    loading: isLoading, 
    error: errorMsg, 
    refresh: refetch,
    lastUpdated,
    stale,
    cacheMessage
  } = useInventory({
    appid: String(game?.appid),
    autoRefresh: false,
    autoLoad: true,
  });
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [selectedMarketPrice, setSelectedMarketPrice] = useState<number | undefined>(undefined);
  
  // États pour les filtres
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [priceMinFilter, setPriceMinFilter] = useState<string>('');
  const [priceMaxFilter, setPriceMaxFilter] = useState<string>('');
  const [weaponFilter, setWeaponFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  // Sélection multiple
  const [multiSelected, setMultiSelected] = useState<Record<string, { item: InventoryItem; price: string; marketPrice?: number }>>({});
  const multiSelectedCount = Object.keys(multiSelected).length;
  
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
  const [listedItemIds, setListedItemIds] = useState<string[]>([]); // depuis le serveur
  const [sessionListedIds, setSessionListedIds] = useState<Set<string>>(new Set()); // listés localement depuis dernier refresh

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
    
    // Ajouter un délai pour éviter le rate limit
    setTimeout(() => {
      // Forcer un fresh contre Steam (via API server qui remplacera le cache DB) et utiliser directement la réponse
      fetch(`/api/inventory-cache?appid=${game?.appid}&currency=${currency}&force=true`, { cache: 'no-store' })
        .then(r => r.json())
        .then(d => {
          if (d?.items) {
            // Hydrater l'état local sans faire un second appel
            // On laisse le hook réutiliser le cache au prochain rendu
          }
        })
        .catch(() => {})
        .finally(() => refetch());
    }, 1000); // 1 seconde de délai
  };

  // Charger les prix en arrière-plan une fois les items chargés
  useEffect(() => {
    if (!items || items.length === 0) return;
    const unique = Array.from(new Set(items.map(i => i.name)));
    fetch('/api/inventory/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: unique })
    })
      .then(r => r.json())
      .then(d => setPriceMap(d.prices || {}))
      .catch(() => {});
  }, [items]);

  // Marquer que le premier chargement a eu lieu pour afficher le bouton de mise à jour ensuite
  useEffect(() => {
    if (!loadedOnce && !isLoading && !errorMsg && items && items.length > 0) {
      setLoadedOnce(true);
    }
  }, [items, isLoading, errorMsg, loadedOnce]);

  // Fonction de validation intelligente des prix
  const validatePrice = (price: number, marketPrice?: number): { isValid: boolean; message?: string; warning?: string } => {
    if (!marketPrice || marketPrice <= 0) {
      // Si pas de prix du marché, validation basique
      if (price < 0.01) {
        return { isValid: false, message: "Le prix minimum est de 0.01€" };
      }
      if (price > 10000) {
        return { isValid: false, message: "Le prix maximum est de 10,000€" };
      }
      return { isValid: true };
    }

    const minPrice = marketPrice * 0.1; // 10% du prix du marché
    const maxPrice = marketPrice * 5; // 500% du prix du marché
    const warningThreshold = marketPrice * 2; // 200% du prix du marché

    if (price < minPrice) {
      return { 
        isValid: false, 
        message: `Le prix minimum recommandé est ${minPrice.toFixed(2)}€ (10% du prix du marché)` 
      };
    }

    if (price > maxPrice) {
      return { 
        isValid: false, 
        message: `Le prix maximum autorisé est ${maxPrice.toFixed(2)}€ (500% du prix du marché)` 
      };
    }

    if (price > warningThreshold) {
      return { 
        isValid: true, 
        warning: `Attention : Votre prix (${price.toFixed(2)}€) est ${(price/marketPrice*100).toFixed(0)}% du prix du marché. Êtes-vous sûr ?` 
      };
    }

    return { isValid: true };
  };

  // Détection des skins rares
  const isRareSkin = (item: InventoryItem | null): boolean => {
    if (!item || !item.name) return false;
    
    const name = item.name.toLowerCase();
    const rarePatterns = [
      'blue gem', 'sapphire', 'ruby', 'emerald', 'dragon lore', 'medusa', 'howl',
      'fire serpent', 'contraband', 'karambit', 'm9 bayonet', 'butterfly',
      'printstream', 'temukau', 'asiimov', 'hyper beast', 'neon rider'
    ];
    return rarePatterns.some(pattern => name.includes(pattern));
  };

  const handleSell = (item: InventoryItem) => {
    setSelectedItem(item);
    const mp = priceMap[item.name] ?? item.marketPrice;
    setSelectedMarketPrice(typeof mp === 'number' ? mp : undefined);
    setSellPrice(typeof mp === 'number' ? mp.toFixed(2) : '');
    setSellDialogOpen(true);
  };

  const toggleMultiSelect = (item: InventoryItem) => {
    if (listedItemIds.includes(item.id) || sessionListedIds.has(item.id)) return;
    setMultiSelected(prev => {
      const copy = { ...prev };
      if (copy[item.id]) {
        delete copy[item.id];
      } else {
        const mp = priceMap[item.name] ?? item.marketPrice;
        const defaultPrice = typeof mp === 'number' && mp > 0 ? mp.toFixed(2) : '0.50';
        copy[item.id] = { item, price: defaultPrice, marketPrice: typeof mp === 'number' ? mp : undefined };
      }
      return copy;
    });
  };

  const updateMultiPrice = (id: string, value: string) => {
    setMultiSelected(prev => ({ ...prev, [id]: { ...prev[id], price: value } }));
  };

  const handleListAllSelected = async () => {
    const ids = Object.keys(multiSelected);
    if (ids.length === 0) return;
    if (!confirm(`Mettre en vente ${ids.length} item(s) ?`)) return;
    for (const id of ids) {
      const entry = multiSelected[id];
      const price = parseFloat(entry.price);
      if (!entry || isNaN(price) || price <= 0) continue;
      try {
        const v = validatePrice(price, entry.marketPrice);
        if (!v.isValid) continue;
        const res = await fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: entry.item.id,
            itemName: entry.item.name,
            itemImage: entry.item.icon,
            rarityCode: entry.item.rarityCode,
            game: game.key,
            price,
          })
        });
        if (res.ok) {
          setSessionListedIds(prev => new Set(prev).add(entry.item.id));
          setMultiSelected(prev => { const c = { ...prev }; delete c[id]; return c; });
        }
      } catch {}
    }
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
    if (isNaN(price) || price < 0) {
      toast({
        title: "Erreur",
        description: "Le prix ne peut pas être négatif.",
        variant: "destructive",
      });
      return;
    }

    // Validation intelligente du prix
    const validation = validatePrice(price, selectedMarketPrice);
    
    if (!validation.isValid) {
      toast({
        title: "Prix invalide",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    // Pour les skins rares ou prix élevés, demander confirmation
    const isRare = isRareSkin(selectedItem);
    const isHighPrice = price > 1000;
    
    if (validation.warning || isRare || isHighPrice) {
      const confirmMessage = validation.warning || 
        (isRare ? "Ce skin est rare et peut avoir une valeur élevée. Êtes-vous sûr ?" : 
         "Prix élevé détecté. Êtes-vous sûr ?");
      
      if (!confirm(confirmMessage)) {
        return;
      }
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
          rarityCode: selectedItem.rarityCode,
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
        
        // Fermer la modal et réinitialiser (sans rechargement de l'inventaire)
        setSellDialogOpen(false);
        setSelectedItem(null);
        setSellPrice('');
        setSelectedMarketPrice(undefined);
        // Marquer localement cet item comme listé pour désactiver la revente jusqu'au prochain refresh
        setSessionListedIds(prev => new Set(prev).add(selectedItem.id));
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

  // Si on ouvre la modale de vente sans prix marché connu, tenter un fetch ciblé
  useEffect(() => {
    if (!sellDialogOpen || !selectedItem) return;
    if (selectedMarketPrice !== undefined) return;
    fetch('/api/inventory/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: [selectedItem.name] })
    })
      .then(r => r.json())
      .then(d => {
        const mp = d?.prices?.[selectedItem.name];
        if (typeof mp === 'number') {
          setSelectedMarketPrice(mp);
          if (!sellPrice) setSellPrice(mp.toFixed(2));
        }
      })
      .catch(() => {});
  }, [sellDialogOpen, selectedItem, selectedMarketPrice, sellPrice]);

  // Logique de filtrage
  const filteredItems = items.filter(item => {
    const isListed = listedItemIds.includes(item.id) || sessionListedIds.has(item.id);
    if (isListed) return false; // Ne jamais afficher les items déjà listés
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
      // Mapping direct des codes de rareté vers les valeurs de filtre
      const rarityFilterMap: Record<string, string> = {
        'Rarity_Common_Weapon': 'rarity_consumer',
        'Rarity_Uncommon_Weapon': 'rarity_industrial',
        'Rarity_Rare_Weapon': 'rarity_milspec',
        'Rarity_Mythical_Weapon': 'rarity_restricted',
        'Rarity_Legendary_Weapon': 'rarity_classified',
        'Rarity_Ancient_Weapon': 'rarity_covert',
        'Rarity_Immortal_Weapon': 'rarity_exceedingly_rare',
      };
      
      const itemRarityFilter = item.rarityCode ? rarityFilterMap[item.rarityCode] : null;
      if (itemRarityFilter !== rarityFilter) {
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
        {loadedOnce && !isLoading && (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant={hasActiveFilters ? "default" : "outline"}
             className={`flex items-center gap-2 ${hasActiveFilters ? 'bg-opnskin-accent text-opnskin-text-primary' : 'border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10'}`}
            >
              <Filter className="w-4 h-4" />
              {t('inventory.filters', 'Filtres')}
             {hasActiveFilters && <Badge className="ml-1 bg-opnskin-bg-card/40 text-opnskin-text-primary text-xs">Actif</Badge>}
            </Button>
            <Button 
              onClick={handleRefreshInventory}
              disabled={isLoading}
              className="btn-opnskin flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Mettre à jour l'inventaire
            </Button>
          </div>
        )}
      </div>

      {/* Affichage des informations de cache */}
      {hasRequestedLoad && !isLoading && !errorMsg && (
        <div className="w-full max-w-6xl mb-6">
          <div className="flex items-center justify-between text-sm text-opnskin-text-secondary">
            <div className="flex items-center gap-4">
              {stale && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  ⚠️ Cache ancien
                </Badge>
              )}
              {lastUpdated > 0 && (
                <span>
                  Mis à jour il y a {lastUpdated} secondes
                </span>
              )}
              {cacheMessage && (
                <span className="text-yellow-400">
                  {cacheMessage}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Total: {filteredItems.length} items</span>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
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
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-red-500 text-lg font-bold text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            {errorMsg.includes('Limite de requêtes') ? (
              <div className="space-y-2">
                <div>⚠️ Trop de requêtes vers Steam</div>
                <div className="text-sm text-gray-500">
                  Steam limite le nombre de requêtes. Veuillez patienter avant de rafraîchir.
                </div>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  className="mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div>❌ Erreur de chargement</div>
                <div className="text-sm text-gray-500">{errorMsg}</div>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  className="mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Réessayer
                </Button>
              </div>
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
        <div>
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
                          <SelectItem value="rarity_consumer">{t('rarity.consumer', 'Consommateur')}</SelectItem>
                          <SelectItem value="rarity_industrial">{t('rarity.industrial', 'Industriel')}</SelectItem>
                          <SelectItem value="rarity_milspec">{t('rarity.milspec', 'Militaire')}</SelectItem>
                          <SelectItem value="rarity_restricted">{t('rarity.restricted', 'Restreint')}</SelectItem>
                          <SelectItem value="rarity_classified">{t('rarity.classified', 'Classé')}</SelectItem>
                          <SelectItem value="rarity_covert">{t('rarity.covert', 'Secret')}</SelectItem>
                          <SelectItem value="rarity_exceedingly_rare">{t('rarity.exceedingly_rare', 'Extraordinaire')}</SelectItem>
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

                    {/* Suppression du filtre "Masquer items déjà listés" : les items listés sont toujours exclus */}
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
                <SkinCard
                  key={item.id}
                  name={item.name}
                  image={item.icon}
                  rarity={item.rarityCode || undefined}
                  price={priceMap[item.name] ?? item.marketPrice}
                  currency={currency}
                  wear={weaponWear}
                  actionButton={
                    (listedItemIds.includes(item.id) || sessionListedIds.has(item.id)) ? (
                      <Button size="sm" disabled className="w-full opacity-70 cursor-not-allowed">Déjà listé</Button>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 dark:bg-opnskin-blue dark:text-white dark:border-transparent dark:hover:bg-opnskin-blue/80" 
                          onClick={() => handleSell(item)}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {t('inventory.sell', 'Vendre')}
                        </Button>
                        <Button
                          size="sm"
                          variant={multiSelected[item.id] ? 'default' : 'outline'}
                         className={`text-xs ${multiSelected[item.id] ? 'bg-opnskin-accent text-opnskin-text-primary' : 'border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10'}`}
                          onClick={() => toggleMultiSelect(item)}
                          aria-pressed={!!multiSelected[item.id]}
                          title={multiSelected[item.id] ? 'Désélectionner' : 'Sélectionner pour vente multiple'}
                        >
                          {multiSelected[item.id] ? 'Sélectionné' : 'Sélectionner'}
                        </Button>
                      </div>
                    )
                  }
                  onDetails={() => handleDetails(item)}
                />
              );
            })}
          </div>
          {multiSelectedCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-opnskin-bg-card/95 border-t border-opnskin-bg-secondary z-50">
              <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="text-sm text-opnskin-text-secondary">
                  {multiSelectedCount} sélectionné(s)
                </div>
                <div className="flex-1 overflow-x-auto">
                  <div className="flex items-center gap-3 min-w-[600px]">
                    {Object.values(multiSelected).map(sel => (
                      <div key={sel.item.id} className="flex items-center gap-2 bg-opnskin-bg-secondary rounded px-2 py-1 border border-opnskin-bg-secondary">
                        <img src={sel.item.icon} alt={sel.item.name} className="w-8 h-8 object-contain" />
                        <div className="text-xs max-w-[220px] truncate" title={sel.item.name}>{sel.item.name}</div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={sel.price}
                          onChange={(e) => updateMultiPrice(sel.item.id, e.target.value)}
                          className="h-8 w-24 bg-opnskin-bg-primary border-opnskin-bg-secondary text-opnskin-text-primary"
                        />
                        {typeof sel.marketPrice === 'number' && (
                          <span className="text-[10px] text-opnskin-text-secondary">min {(sel.marketPrice*0.1).toFixed(2)}€</span>
                        )}
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => toggleMultiSelect(sel.item)}>✕</Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10" onClick={() => setMultiSelected({})}>Tout effacer</Button>
                  <Button className="btn-opnskin" onClick={handleListAllSelected}>Lister tout</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de vente */}
      <Dialog open={sellDialogOpen && !!selectedItem} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-opnskin-bg-card border-opnskin-bg-secondary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-opnskin-text-primary flex items-center gap-2">
              <Tag className="w-5 h-5 text-opnskin-primary" />
              Vendre {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informations du skin */}
            <div className="flex items-center gap-4 p-4 bg-opnskin-bg-secondary/30 rounded-lg">
              <img 
                src={selectedItem?.icon} 
                alt={selectedItem?.name} 
                className="w-20 h-20 object-contain rounded-lg border border-opnskin-bg-secondary" 
              />
              <div className="flex-1">
                <h3 className="font-bold text-opnskin-text-primary text-lg">{selectedItem?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs border-opnskin-primary/30 text-opnskin-primary">
                    {isRareSkin(selectedItem) ? "Rare" : "Standard"}
                  </Badge>
                  {selectedMarketPrice !== undefined && (
                    <span className="text-sm text-opnskin-text-secondary">
                      Prix marché: {formatPrice(selectedMarketPrice, currency, {
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
              </div>
            </div>

            {/* Prix de vente avec validation en temps réel */}
            <div className="space-y-3">
              <Label htmlFor="sell-price" className="text-opnskin-text-primary font-semibold">
                Prix de vente (€)
              </Label>
              <div className="relative">
                <Input
                  id="sell-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellPrice}
                  onChange={(e) => {
                    setSellPrice(e.target.value);
                    // Validation en temps réel
                    const price = parseFloat(e.target.value);
                    if (!isNaN(price) && selectedItem) {
                      const validation = validatePrice(price, selectedMarketPrice);
                      // On peut ajouter un indicateur visuel ici si nécessaire
                    }
                  }}
                  placeholder="0.00"
                  className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary text-lg font-mono pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-opnskin-text-secondary text-sm">
                  €
                </span>
              </div>
              
              {/* Indicateurs de prix recommandés */}
              {selectedMarketPrice !== undefined && (
                <div className="text-xs text-opnskin-text-secondary space-y-1">
                  <div className="flex justify-between">
                    <span>Prix minimum recommandé:</span>
                    <span className="text-opnskin-accent font-mono">
                      {(selectedMarketPrice * 0.1).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prix maximum autorisé:</span>
                    <span className="text-opnskin-accent font-mono">
                      {(selectedMarketPrice * 5).toFixed(2)}€
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSellConfirm} 
                className="btn-opnskin flex-1" 
                disabled={isSelling}
              >
                {isSelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vente en cours...
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4 mr-2" />
                    Confirmer la vente
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSellDialogOpen(false)}
                className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
              >
                Annuler
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
                          {t(getWeaponWear(selectedItem.name))}
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