'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/use-cart-store';
import { useToast } from '@/components/ui/use-toast';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useSearchStore } from '@/hooks/use-search-store';
import { useTranslation } from 'next-i18next';

const GAMES = [
  { key: 'cs2', name: 'CS2', cover: '/CS2.png' },
  { key: 'dota2', name: 'Dota2', cover: '/Dota2.png' },
  { key: 'rust', name: 'Rust', cover: '/Rust.png' },
  { key: 'tf2', name: 'TF2', cover: '/TF2.png' },
];

const CATEGORIES = [
  { key: 'rifles', name: 'Fusils', icon: '/icons/rifle.svg' },
  { key: 'pistols', name: 'Pistolets', icon: '/icons/pistol.svg' },
  { key: 'knives', name: 'Couteaux', icon: '/icons/knife.svg' },
  { key: 'gloves', name: 'Gants', icon: '/icons/gloves.svg' },
];

const RARITIES = [
  { key: 'all', name: 'Toutes' },
  { key: 'Consumer Grade', name: 'Consumer' },
  { key: 'Industrial Grade', name: 'Industrial' },
  { key: 'Mil-Spec Grade', name: 'Mil-Spec' },
  { key: 'Restricted', name: 'Restricted' },
  { key: 'Classified', name: 'Classified' },
  { key: 'Covert', name: 'Covert' },
];

const EXTERIORS = [
  { key: 'all', name: 'Tous' },
  { key: 'Factory New', name: 'Factory New' },
  { key: 'Minimal Wear', name: 'Minimal Wear' },
  { key: 'Field-Tested', name: 'Field-Tested' },
  { key: 'Well-Worn', name: 'Well-Worn' },
  { key: 'Battle-Scarred', name: 'Battle-Scarred' },
];

const mockItems = [
  {
    id: '1',
    name: 'USP-S | Ticket to Hell',
    icon: '/placeholder.svg',
    price: 12.5,
    float: 0.12,
    quality: 'Minimal Wear',
    rarity: 'Restricted',
    category: 'pistols',
    stattrak: true,
    souvenir: false,
    game: 'cs2',
  },
  {
    id: '2',
    name: 'AK-47 | Redline',
    icon: '/placeholder.svg',
    price: 38,
    float: 0.18,
    quality: 'Field-Tested',
    rarity: 'Classified',
    category: 'rifles',
    stattrak: false,
    souvenir: false,
    game: 'cs2',
  },
];

function MarketplaceGameSelect({ onSelect }: { onSelect: (game: string) => void }) {
  const { t } = useTranslation('common');
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#0e0e10] px-4 pt-8 pb-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-white font-rajdhani drop-shadow-lg">
        {t('marketplace.choose_universe', 'Choisis ton univers')}
        <span className="ml-4 px-3 py-1 rounded-full bg-white text-[#287CFA] text-base font-semibold align-middle shadow-md">{t('marketplace.badge')}</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {GAMES.map(game => (
          <button
            key={game.key}
            onClick={() => onSelect(game.key)}
            className="group relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#101c2c] to-[#0e0e10] border-2 border-transparent hover:border-[#00ffe7] transition-all duration-300 focus:outline-none flex flex-col"
            style={{ width:  "100%", maxWidth: 400, height: 400, minHeight: 400 }}
            aria-label={t(`marketplace.game_${game.key}`, game.name)}
          >
            <img
              src={game.cover}
              alt={t(`marketplace.game_${game.key}`, game.name)}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00ffe7]/20 via-transparent to-transparent pointer-events-none group-hover:from-[#00ffe7]/40 transition-all duration-300" />
          </button>
        ))}
      </div>
      <style jsx global>{`
        .neon-glow {
          box-shadow: 0 0 8px #00ffe7, 0 0 16px #00ffe7, 0 0 32px #00ffe7;
          text-shadow: 0 0 8px #00ffe7, 0 0 16px #00ffe7;
        }
      `}</style>
    </div>
  );
}

function MarketplaceByGame({ game, onBack }: { game: string, onBack: () => void }) {
  const { t } = useTranslation('common');
  const searchQuery = useSearchStore((state) => state.searchQuery);
  // Placeholder pour la suite : header sticky, filtres, grille
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-[#0e0e10]/95 backdrop-blur border-b border-[#1a1a1d] px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onBack} className="text-[#00ffe7] font-bold text-lg mr-2 hover:underline">←</button>
          <h2 className="text-2xl md:text-3xl font-bold font-rajdhani tracking-tight">{t('marketplace.title')} {t(`marketplace.game_${game}`)}</h2>
            </div>
        <div className="flex flex-1 gap-2 items-center justify-end">
          {/* Recherche supprimée, gérée par le header global */}
          <select className="bg-[#18181b] border border-[#222] rounded-lg px-3 py-2 text-white">
            <option value="price_asc">{t('marketplace.sort_price_asc')}</option>
            <option value="price_desc">{t('marketplace.sort_price_desc')}</option>
            <option value="float_asc">{t('marketplace.sort_float_asc')}</option>
            <option value="good_deal">{t('marketplace.sort_good_deal')}</option>
          </select>
          <select className="bg-[#18181b] border border-[#222] rounded-lg px-3 py-2 text-white">
            <option value="all">{t('marketplace.filter_all')}</option>
            <option value="online">{t('marketplace.filter_online')}</option>
            <option value="offline">{t('marketplace.filter_offline')}</option>
          </select>
          <button className="ml-2 px-4 py-2 rounded-lg bg-[#00ffe7] text-black font-bold hover:bg-[#00e6cc] transition">{t('marketplace.reset')}</button>
                    </div>
                      </div>
      {/* Filtres latéraux ou top bar (à venir) */}
      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="hidden md:block w-64 bg-[#101c2c]/40 border-r border-[#1a1a1d] p-6">{t('marketplace.filters_coming')}</aside>
        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="text-center opacity-60">
            <p className="text-lg">{t('marketplace.grid_coming')}</p>
            <p className="mt-2 text-sm">{t('marketplace.grid_hint')}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { t } = useTranslation('common');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [items] = useState(mockItems);
  const [filteredItems, setFilteredItems] = useState(mockItems);
  const [sort, setSort] = useState('price_desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [exterior, setExterior] = useState('all');
  const [stattrak, setStattrak] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [floatRange, setFloatRange] = useState([0, 1]);
  const { items: cartItems, add } = useCartStore();
  const { toast } = useToast();
  const currency = useCurrencyStore((state) => state.currency);
  const searchQuery = useSearchStore((state) => state.searchQuery);

  useEffect(() => {
    let result = [...items];
    if (selectedGame !== 'all') result = result.filter(i => i.game === selectedGame);
    if (selectedCategory !== 'all') result = result.filter(i => i.category === selectedCategory);
    if (rarity !== 'all') result = result.filter(i => i.rarity === rarity);
    if (exterior !== 'all') result = result.filter(i => i.quality === exterior);
    if (stattrak) result = result.filter(i => i.stattrak);
    result = result.filter(i => i.price >= priceRange[0] && i.price <= priceRange[1]);
    result = result.filter(i => i.float >= floatRange[0] && i.float <= floatRange[1]);
    if (searchQuery.trim()) result = result.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'float_asc': result.sort((a, b) => a.float - b.float); break;
      case 'float_desc': result.sort((a, b) => b.float - a.float); break;
    }
    setFilteredItems(result);
  }, [items, selectedGame, selectedCategory, rarity, exterior, stattrak, priceRange, floatRange, searchQuery, sort]);

  if (!selectedGame) {
    return <MarketplaceGameSelect onSelect={setSelectedGame} />;
  }

  return <MarketplaceByGame game={selectedGame} onBack={() => setSelectedGame(null)} />;
}
