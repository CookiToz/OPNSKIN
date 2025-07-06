import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-7xl">
          {items.map(item => {
            const floatState = selectedFloatId === item.id ? useFloat(item.id) : null;
            return (
              <Card key={item.id} className="bg-opnskin-bg-secondary border-opnskin-primary/20 hover:border-opnskin-primary transition-all duration-200 shadow-md flex flex-col items-center">
                <CardContent className="flex flex-col items-center p-4">
                  <img src={item.icon} alt={item.name} className="w-24 h-24 object-contain mb-2" />
                  <div className="text-center text-base font-semibold font-rajdhani text-opnskin-text-primary truncate w-32">{item.name}</div>
                  {item.marketPrice !== undefined && (
                    <div className="text-opnskin-accent text-sm mt-1">{item.marketPrice} €</div>
                  )}
                  {selectedFloatId === item.id && floatState ? (
                    <AnimatePresence>
                      {selectedFloatId === item.id && (floatState.isLoading || floatState.isError || floatState.float !== null) && (
                        <motion.div
                          key={item.id + "-float"}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.35 }}
                          className="mt-2"
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
                    <button className="btn-opnskin-secondary mt-2" onClick={() => handleShowFloat(item.id)}>
                      Voir le float
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 