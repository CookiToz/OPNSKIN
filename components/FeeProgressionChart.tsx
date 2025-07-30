"use client";

import { Badge } from '@/components/ui/badge';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useTranslation } from 'next-i18next';

const feeData = [
  { level: 'Non vérifié', depense: '-', fee: 5, color: '#ff3b3b', icon: '❌' },
  { level: 'Vérifié', depense: '-', fee: 3.5, color: '#00fff7', icon: '✅' },
  { level: '1', depense: 50, fee: 3.25, color: '#00fff7', icon: '🥉' },
  { level: '5', depense: 200, fee: 3, color: '#00fff7', icon: '🥉' },
  { level: '10', depense: 500, fee: 2.75, color: '#00fff7', icon: '🥈' },
  { level: '15', depense: 1500, fee: 2.5, color: '#00fff7', icon: '🥈' },
  { level: '20', depense: 5000, fee: 2.25, color: '#00fff7', icon: '🥇' },
  { level: '25', depense: 10000, fee: 2, color: '#00fff7', icon: '🥇' },
  { level: '30', depense: 20000, fee: 1.75, color: '#00fff7', icon: '💎' },
  { level: '35', depense: 50000, fee: 1.5, color: '#00fff7', icon: '💎' },
  { level: '40', depense: 70000, fee: 1.25, color: '#00fff7', icon: '👑' },
  { level: '45', depense: 100000, fee: 1, color: '#00fff7', icon: '👑' },
];

const currencySymbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  RUB: '₽',
  CNY: '¥',
};

const currencyRates: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  RUB: 95,
  CNY: 7.8,
};

export default function FeeProgressionChart() {
  const { currency } = useCurrencyStore();
  const symbol = currencySymbols[currency];
  const rate = currencyRates[currency];
  const { t } = useTranslation('common');

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 mb-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold font-satoshi-bold text-opnskin-text-primary mb-4">
          Système de <span className="neon-text">niveaux</span> et frais dégressifs
        </h2>
        <p className="text-lg text-opnskin-text-secondary max-w-2xl mx-auto">
          Progressez dans notre système de niveaux pour réduire vos frais de vente et optimiser vos profits
        </p>
      </div>
      
      <div className="rounded-2xl bg-gradient-to-br from-opnskin-bg-card/80 to-opnskin-bg-secondary/40 border border-opnskin-primary/20 p-8 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:text-base text-left">
            <thead>
              <tr className="border-b border-opnskin-primary/30">
                <th className="py-4 px-6 font-bold text-opnskin-text-primary text-lg">Niveau</th>
                <th className="py-4 px-6 font-bold text-opnskin-text-primary text-lg">Dépense cumulée ({symbol})</th>
                <th className="py-4 px-6 font-bold text-opnskin-text-primary text-lg">Frais de vente</th>
                <th className="py-4 px-6 font-bold text-opnskin-text-primary text-lg">Statut</th>
              </tr>
            </thead>
            <tbody>
              {feeData.map((row, i) => (
                <tr key={row.level} className="border-b border-opnskin-bg-secondary/20 hover:bg-opnskin-primary/5 transition-all duration-200 group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-opnskin-bg-secondary/60 border border-opnskin-primary/20 group-hover:border-opnskin-primary/40 transition-colors">
                        <span className="text-xl">{row.icon}</span>
                      </div>
                      <div>
                        <Badge className="bg-opnskin-primary/20 text-opnskin-primary border-opnskin-primary/40 px-4 py-2 font-bold text-base">
                          {row.level}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-opnskin-text-secondary text-lg">
                      {typeof row.depense === 'number' ? (Math.round(row.depense * rate)).toLocaleString() + ' ' + symbol : '-'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-opnskin-accent text-xl font-bold">{row.fee}%</span>
                      {row.fee <= 2 && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {row.level === 'Non vérifié' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          À vérifier
                        </Badge>
                      ) : row.level === 'Vérifié' ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Vérifié
                        </Badge>
                      ) : row.fee <= 2 ? (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          Elite
                        </Badge>
                      ) : row.fee <= 2.5 ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Pro
                        </Badge>
                      ) : (
                        <Badge className="bg-opnskin-primary/20 text-opnskin-primary border-opnskin-primary/30">
                          Standard
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Légende */}
        <div className="mt-8 pt-6 border-t border-opnskin-bg-secondary/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-opnskin-primary"></div>
              <span className="text-opnskin-text-secondary">Standard : Frais de 3% à 3.5%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-opnskin-text-secondary">Pro : Frais de 2.25% à 2.5%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-opnskin-text-secondary">Elite : Frais de 1% à 2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 