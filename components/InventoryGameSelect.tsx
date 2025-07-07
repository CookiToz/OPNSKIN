import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'next-i18next';

// Ordre identique à la marketplace
const GAMES = [
  { key: 'cs2', name: 'CS2', cover: '/CS2.png', appid: 730 },
  { key: 'dota2', name: 'Dota 2', cover: '/Dota2.png', appid: 570 },
  { key: 'rust', name: 'Rust', cover: '/Rust.png', appid: 252490 },
  { key: 'tf2', name: 'TF2', cover: '/TF2.png', appid: 440 },
];

type InventoryGameSelectProps = {
  selectedGame: string | null;
  onSelect: (game: typeof GAMES[number]) => void;
  context?: 'inventory' | 'marketplace';
};

export default function InventoryGameSelect({ selectedGame, onSelect, context = 'inventory' }: InventoryGameSelectProps) {
  const { t } = useTranslation('common');
  useEffect(() => {
    // Restaure le jeu sélectionné depuis localStorage
    const saved = localStorage.getItem('opnskin-inventory-game');
    if (saved && !selectedGame) {
      const found = GAMES.find(g => g.key === saved);
      if (found) onSelect(found);
    }
    // eslint-disable-next-line
  }, []);

  const handleSelect = (game: typeof GAMES[number]) => {
    localStorage.setItem('opnskin-inventory-game', game.key);
    onSelect(game);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#0e0e10] px-4 pt-8 pb-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-white font-rajdhani drop-shadow-lg flex items-center justify-center gap-4">
        <span>{t('inventory.selectGameTitle')}</span>
        {context === 'inventory' && (
          <span className="px-3 py-1 rounded-full bg-white text-[#287CFA] text-base font-semibold align-middle shadow-md">
            {t('inventory.badge', 'INVENTAIRE')}
          </span>
        )}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {GAMES.map(game => (
          <button
            key={game.key}
            onClick={() => handleSelect(game)}
            className={
              `group relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#101c2c] to-[#0e0e10] border-2 border-transparent hover:border-[#00ffe7] transition-all duration-300 focus:outline-none flex flex-col`
            }
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
    </div>
  );
} 