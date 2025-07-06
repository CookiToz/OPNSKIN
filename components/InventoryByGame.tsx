import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'next-i18next';
import { useInventory } from "@/components/InventoryProvider";
import { useFloat } from "@/components/FloatProvider";
import { motion, AnimatePresence } from "framer-motion";

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
  const { items, isLoading, isError, errorMsg } = useInventory(game?.appid ? String(game.appid) : undefined);
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

  return (
    <div className="flex flex-col items-center py-8 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button onClick={handleBack} className="text-white font-bold text-3xl mr-2 hover:text-[#00ffe7] transition-colors duration-200" aria-label={t('inventory.back', 'Retour à la sélection du jeu')}>←</button>
        )}
        <h2 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-tight text-opnskin-primary drop-shadow-lg">
          {t('inventory.title', 'Inventaire')} {t(`marketplace.game_${game.key}`, game.name)}
        </h2>
      </div>
      {isLoading ? (
        <div className="text-opnskin-primary text-xl font-rajdhani animate-pulse py-16">{t('inventory.loading', 'Chargement de l’inventaire…')}</div>
      ) : isError ? (
        <div className="text-red-500 text-lg font-bold py-16">{errorMsg || t('inventory.error_loading', 'Erreur lors du chargement de l’inventaire')}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-text-secondary text-lg font-rajdhani text-center">
            {t('inventory.empty_game', 'L\'inventaire {{gameName}} est vide', { gameName: t(`marketplace.game_${game.key}`, game.name) })}
          </div>
          {onBack && (
            <button 
              onClick={handleBack} 
              className="btn-opnskin-secondary flex items-center gap-2"
            >
              ← {t('inventory.back_to_games', 'Retour aux jeux')}
            </button>
          )}
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