'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Upload, Download, Trash2, Edit3, Package, ExternalLink, Tag } from 'lucide-react';
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import InventoryGameSelect from '@/components/InventoryGameSelect';
import InventoryByGame from '@/components/InventoryByGame';
import { useUser } from '@/components/UserProvider';
import Image from 'next/image';

type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  marketPrice?: number;
  float?: number;
  csfloatLink?: string;
  statTrak?: boolean;
  quality?: string;
  rarity?: string;
  category?: string;
  listed: boolean;
  listedPrice?: number;
  rarityCode?: string;
};

const rarityColors: Record<string, string> = {
  'Consumer Grade': 'text-opnskin-text-secondary',
  'Industrial Grade': 'text-opnskin-accent',
  'Mil-Spec Grade': 'text-opnskin-accent',
  'Restricted': 'text-opnskin-accent',
  'Classified': 'text-opnskin-accent',
  'Covert': 'text-opnskin-accent',
  'Contraband': 'text-opnskin-accent',
};

const getRarityClass = (rarity: string) => rarityColors[rarity] || 'text-opnskin-text-primary';

const weaponCategories: Record<string, string> = {
  AK: 'rifles',
  Galil: 'rifles',
  M4A1: 'rifles',
  M4A4: 'rifles',
  AWP: 'rifles',
  SCAR: 'rifles',
  G3SG1: 'rifles',
  Glock: 'pistols',
  USP: 'pistols',
  P250: 'pistols',
  P2000: 'pistols',
  Five: 'pistols',
  Tec: 'pistols',
  CZ75: 'pistols',
  Deagle: 'pistols',
  R8: 'pistols',
  MP7: 'smg',
  MP9: 'smg',
  MAC: 'smg',
  P90: 'smg',
  UMP: 'smg',
  MP5: 'smg',
  Nova: 'shotguns',
  XM1014: 'shotguns',
  MAG: 'heavy',
  Negev: 'heavy',
};

function getWeaponCategory(name: string): string {
  const categories: Record<string, string> = {
    AK: 'rifles', Galil: 'rifles', M4A1: 'rifles', M4A4: 'rifles', AWP: 'rifles',
    Glock: 'pistols', USP: 'pistols', P250: 'pistols', Deagle: 'pistols',
    MP7: 'smg', MP9: 'smg', P90: 'smg', UMP: 'smg'
  };
  
  for (const keyword in categories) {
    if (name.includes(keyword)) return categories[keyword];
  }
  return 'other';
}

function getQualityFromName(name: string): string {
  if (name.includes('Factory New')) return 'Factory New';
  if (name.includes('Minimal Wear')) return 'Minimal Wear';
  if (name.includes('Field-Tested')) return 'Field-Tested';
  if (name.includes('Well-Worn')) return 'Well-Worn';
  if (name.includes('Battle-Scarred')) return 'Battle-Scarred';
  return 'Unknown';
}

function getRarityFromName(name: string): string {
  if (name.includes('Consumer Grade')) return 'Consumer Grade';
  if (name.includes('Industrial Grade')) return 'Industrial Grade';
  if (name.includes('Mil-Spec Grade')) return 'Mil-Spec Grade';
  if (name.includes('Restricted')) return 'Restricted';
  if (name.includes('Classified')) return 'Classified';
  if (name.includes('Covert')) return 'Covert';
  if (name.includes('Contraband')) return 'Contraband';
  return 'Unknown';
}

// Nouveau mapping basé sur internal_name du tag Rarity
const rarityMap: Record<string, { name: string; color: string }> = {
  'Rarity_Common_Weapon': { name: 'Consommateur', color: '#B0C3D9' },
  'Rarity_Uncommon_Weapon': { name: 'Industriel', color: '#5E98D9' },
  'Rarity_Rare_Weapon': { name: 'Militaire', color: '#4B69FF' },
  'Rarity_Mythical_Weapon': { name: 'Restreint', color: '#8847FF' },
  'Rarity_Legendary_Weapon': { name: 'Classé', color: '#D32CE6' },
  'Rarity_Ancient_Weapon': { name: 'Secret', color: '#EB4B4B' },
  'Rarity_Immortal_Weapon': { name: 'Extraordinaire', color: '#FFD700' },
};

// Mapping code Steam -> clé i18n
const rarityKeyMap: Record<string, string> = {
  'Rarity_Common_Weapon': 'rarity.consumer',
  'Rarity_Uncommon_Weapon': 'rarity.industrial',
  'Rarity_Rare_Weapon': 'rarity.milspec',
  'Rarity_Mythical_Weapon': 'rarity.restricted',
  'Rarity_Legendary_Weapon': 'rarity.classified',
  'Rarity_Ancient_Weapon': 'rarity.covert',
  'Rarity_Immortal_Weapon': 'rarity.exceedingly_rare',
};

const GAMES = [
  { key: 'cs2', name: 'CS2', cover: '/CS2.png', appid: 730 },
  { key: 'dota2', name: 'Dota 2', cover: '/Dota2.png', appid: 570 },
  { key: 'tf2', name: 'TF2', cover: '/TF2.png', appid: 440 },
  { key: 'rust', name: 'Rust', cover: '/Rust.png', appid: 252490 },
];

export default function Inventory() {
  const { t } = useTranslation('common');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currency = useCurrencyStore((state) => state.currency);
  const floatCache = useRef<Map<string, { float: number; csfloatLink?: string; timestamp: number }>>(new Map());
  const FLOAT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const [loadingFloatId, setLoadingFloatId] = useState<string | null>(null);
  const cryptoRates = useCryptoRatesStore();
  const [selectedGame, setSelectedGame] = useState<null | typeof GAMES[number]>(null);
  const { user, isLoading: userLoading, isError: userError } = useUser();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser l'appid du jeu sélectionné
      const appid = selectedGame?.appid || 730; // CS2 par défaut
      const response = await fetch(`/api/inventory?currency=${currency}&appid=${appid}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'inventaire');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const processedItems = data.items.map((item: any) => {
        const isStatTrak = item.name.includes('StatTrak');
        
        return {
          id: item.id,
          name: item.name,
          icon: item.icon,
          marketPrice: item.marketPrice,
          float: item.float,
          csfloatLink: item.csfloatLink,
          statTrak: isStatTrak,
          quality: getQualityFromName(item.name),
          rarity: getRarityFromName(item.name),
          category: getWeaponCategory(item.name),
          listed: false,
          listedPrice: undefined,
          rarityCode: item.rarityCode,
        };
      });

      setInventory(processedItems);
      setFilteredInventory(processedItems);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'inventaire:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...inventory];

    if (search.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        result.sort((a, b) => (a.marketPrice || 0) - (b.marketPrice || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.marketPrice || 0) - (a.marketPrice || 0));
        break;
      case 'float_asc':
        result.sort((a, b) => (a.float || 0) - (b.float || 0));
        break;
      case 'float_desc':
        result.sort((a, b) => (b.float || 0) - (a.float || 0));
        break;
    }

    setFilteredInventory(result);
  };

  useEffect(() => {
    applyFilters();
  }, [search, sort, inventory]);

  // Recharger l'inventaire quand le jeu change
  useEffect(() => {
    if (selectedGame) {
      fetchInventory();
    }
  }, [selectedGame, currency]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const listItems = () => {
    console.log('Listing items:', selectedItems);
  };

  const delistItems = () => {
    console.log('Delisting items:', selectedItems);
  };

  const deleteItems = () => {
    console.log('Deleting items:', selectedItems);
  };

  const fetchFloat = async (item: InventoryItem) => {
    if (!item.name) return;
    const now = Date.now();
    const cached = floatCache.current.get(item.name);
    if (cached && now - cached.timestamp < FLOAT_CACHE_DURATION) {
      setInventory((inv) =>
        inv.map((i) =>
          i.id === item.id ? { ...i, float: cached.float, csfloatLink: cached.csfloatLink } : i
        )
      );
      return;
    }
    setLoadingFloatId(item.id);
    try {
      const res = await fetch(`/api/float?market_hash_name=${encodeURIComponent(item.name)}`);
      if (!res.ok) throw new Error('Erreur CSFloat');
      const data = await res.json();
      floatCache.current.set(item.name, { float: data.float, csfloatLink: data.csfloatLink, timestamp: now });
      setInventory((inv) =>
        inv.map((i) =>
          i.id === item.id ? { ...i, float: data.float, csfloatLink: data.csfloatLink } : i
        )
      );
    } catch (e) {
      // Optionally handle error
    } finally {
      setLoadingFloatId(null);
    }
  };

  // Vérifier si l'utilisateur n'est pas connecté
  if (!userLoading && (!user || !user.loggedIn)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-opnskin-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.not_logged_in_title', 'Connecte-toi via Steam pour voir ton inventaire')}</h2>
          <p className="text-opnskin-text-secondary mb-4">{t('inventory.not_logged_in_desc', 'Tu dois être connecté via Steam pour accéder à ton inventaire.')}</p>
          <Button onClick={() => window.location.href = '/api/auth/steam'} className="btn-opnskin flex items-center gap-2">
            <img
              src="/icons8-steam-128.png"
              alt="Steam"
              className="w-6 h-6 object-contain"
            />
            {t('inventory.login_button', 'Se connecter via Steam')}
          </Button>
        </div>
      </div>
    );
  }

  // Chargement du profil utilisateur
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-opnskin-text-secondary/30 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.loading')}</h2>
          <p className="text-opnskin-text-secondary">{t('inventory.loading_description')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-red-400/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.error_title')}</h2>
          <p className="text-opnskin-text-secondary mb-4">{error}</p>
          <Button onClick={fetchInventory} className="btn-opnskin">
            {t('inventory.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {!selectedGame ? (
        <InventoryGameSelect selectedGame={null} onSelect={setSelectedGame} context="inventory" />
      ) : (
        <InventoryByGame game={selectedGame} onBack={() => setSelectedGame(null)} />
      )}
    </div>
  );
} 