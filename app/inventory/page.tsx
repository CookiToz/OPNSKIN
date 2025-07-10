'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/components/UserProvider';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import InventoryGameSelect from '@/components/InventoryGameSelect';
import InventoryByGame from '@/components/InventoryByGame';

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
  listed?: boolean;
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
  { key: 'rust', name: 'Rust', cover: '/Rust.png', appid: 252490 },
  { key: 'tf2', name: 'Team Fortress 2', cover: '/TF2.png', appid: 440 }
] as const;

export default function InventoryPage() {
  const { t } = useTranslation('common');
  const [selectedGame, setSelectedGame] = useState<null | typeof GAMES[number]>(null);
  const { user, isLoading: userLoading, isError: userError } = useUser();

  // Vérifier si l'utilisateur n'est pas connecté
  if (!userLoading && (!user || !user.loggedIn)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-2 md:px-0">
          <Package className="h-14 w-14 md:h-16 md:w-16 text-opnskin-text-secondary/30 mx-auto mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.not_logged_in_title', 'Connecte-toi via Steam pour voir ton inventaire')}</h2>
          <p className="text-opnskin-text-secondary mb-3 md:mb-4 text-base md:text-lg">{t('inventory.not_logged_in_desc', 'Tu dois être connecté via Steam pour accéder à ton inventaire.')}</p>
          <Button onClick={() => window.location.href = '/api/auth/steam'} className="btn-opnskin flex items-center gap-2 w-full max-w-xs mx-auto text-base md:text-lg">
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
        <div className="text-center px-2 md:px-0">
          <Package className="h-14 w-14 md:h-16 md:w-16 text-opnskin-text-secondary/30 mx-auto mb-3 md:mb-4 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.loading')}</h2>
          <p className="text-opnskin-text-secondary text-base md:text-lg">{t('inventory.loading_description')}</p>
        </div>
      </div>
    );
  }

  // Si aucun jeu n'est sélectionné, afficher la sélection de jeu
  if (!selectedGame) {
    return (
      <div className="w-full h-full flex flex-col">
        <InventoryGameSelect selectedGame={null} onSelect={setSelectedGame} context="inventory" />
      </div>
    );
  }

  // Afficher l'inventaire du jeu sélectionné
  return (
    <div className="w-full h-full flex flex-col">
      <InventoryByGame game={selectedGame} onBack={() => setSelectedGame(null)} />
    </div>
  );
} 