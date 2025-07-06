import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'next-i18next';
import { useInventory } from "@/components/InventoryProvider";
import { useFloat } from "@/components/FloatProvider";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from 'lucide-react';

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

// Mapping des codes de rareté vers les noms et couleurs
const rarityMap: Record<string, { name: string; color: string; bgColor: string }> = {
  'Rarity_Common_Weapon': { name: 'Consommateur', color: '#B0C3D9', bgColor: 'bg-[#B0C3D9]/10' },
  'Rarity_Uncommon_Weapon': { name: 'Industriel', color: '#5E98D9', bgColor: 'bg-[#5E98D9]/10' },
  'Rarity_Rare_Weapon': { name: 'Militaire', color: '#4B69FF', bgColor: 'bg-[#4B69FF]/10' },
  'Rarity_Mythical_Weapon': { name: 'Restreint', color: '#8847FF', bgColor: 'bg-[#8847FF]/10' },
  'Rarity_Legendary_Weapon': { name: 'Classé', color: '#D32CE6', bgColor: 'bg-[#D32CE6]/10' },
  'Rarity_Ancient_Weapon': { name: 'Secret', color: '#EB4B4B', bgColor: 'bg-[#EB4B4B]/10' },
  'Rarity_Immortal_Weapon': { name: 'Extraordinaire', color: '#FFD700', bgColor: 'bg-[#FFD700]/10' },
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
  const [hasRequestedLoad, setHasRequestedLoad] = useState(false);
  const { items, isLoading, isError, errorMsg, refetch } = useInventory(hasRequestedLoad ? (game?.appid ? String(game.appid) : undefined) : undefined);
  const [selectedFloatId, setSelectedFloatId] = useState<string | null>(null);
  const [floatTimeout, setFloatTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleShowFloat = (itemId: string) => {
    setSelectedFloatId(itemId);
    if (floatTimeout) clearTimeout(floatTimeout);
    const timeout = setTimeout(() => setSelectedFloatId(null), 5000);
    setFloatTimeout(timeout);
  };

  const handleBack = () => {
    localStorage.removeItem('opnskin-inventory-game');
    if (onBack) onBack();
  };

  const handleRefreshInventory = () => {
    setHasRequestedLoad(true);
    refetch();
  };

  return (
    <div className="flex flex-col items-center py-8 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button onClick={handleBack} className="text-white font-bold text-3xl mr-2 hover:text-[#00ffe7] transition-colors duration-200" aria-label={t('inventory.back', 'Retour à la sélection du jeu')}>←</button>
        )}
        <h2 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-tight text-opnskin-primary drop-shadow-lg">
          {t('inventory.title', 'Inventaire')} {t(`marketplace.game_${game.key}`, game.name)}
        </h2>
        <Button 
          onClick={handleRefreshInventory}
          disabled={isLoading}
          className="btn-opnskin-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('inventory.refresh', 'Actualiser')}
        </Button>
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
      ) : items.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          {items.map(item => {
            const floatState = selectedFloatId === item.id ? useFloat(item.id) : null;
            const rarity = item.rarityCode ? rarityMap[item.rarityCode] : null;
            const weaponCategory = getWeaponCategory(item.name);
            
            return (
              <Card key={item.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group">
                <div className="aspect-square relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-opnskin-bg-card/80 z-10"></div>
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {rarity && (
                    <Badge className="absolute top-3 right-3 z-20 bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30">
                      {rarity.name}
                    </Badge>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-opnskin-text-secondary">{weaponCategory}</span>
                      {item.marketPrice !== undefined && (
                        <span className="font-mono text-opnskin-accent font-bold">{item.marketPrice} €</span>
                      )}
                    </div>
                    <h3 className="font-satoshi-bold text-lg truncate text-opnskin-text-primary">{item.name}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    {selectedFloatId === item.id && floatState ? (
                      <AnimatePresence>
                        {selectedFloatId === item.id && (floatState.isLoading || floatState.isError || floatState.float !== null) && (
                          <motion.div
                            key={item.id + "-float"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.35 }}
                            className="flex-1"
                          >
                            {floatState.isLoading ? (
                              <span className="text-opnskin-primary animate-pulse">Chargement du float…</span>
                            ) : floatState.isError ? (
                              <span className="text-red-500">Erreur : {floatState.errorMsg || 'Impossible de récupérer le float'}</span>
                            ) : floatState.float !== null ? (
                              <span className="text-opnskin-accent font-mono">Float : {floatState.float}</span>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ) : (
                      <Button 
                        size="sm" 
                        className="btn-opnskin-secondary flex-1" 
                        onClick={() => handleShowFloat(item.id)}
                      >
                        Voir le float
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 ml-2"
                    >
                      Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 