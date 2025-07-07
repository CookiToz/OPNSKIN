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
    <div className="w-full max-w-4xl mx-auto mt-20 mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 font-satoshi-bold neon-text">Frais dégressifs selon votre niveau</h2>
      <div className="rounded-xl bg-gradient-to-br from-black/80 to-opnskin-bg-secondary/60 border border-opnskin-bg-secondary p-6 shadow-2xl overflow-x-auto">
        <table className="min-w-full text-sm md:text-base text-left text-white">
          <thead>
            <tr className="border-b border-opnskin-primary/30">
              <th className="py-3 px-4 font-bold">Niveau</th>
              <th className="py-3 px-4 font-bold">Dépense cumulée ({symbol})</th>
              <th className="py-3 px-4 font-bold">Frais de vente</th>
            </tr>
          </thead>
          <tbody>
            {feeData.map((row, i) => (
              <tr key={row.level} className="border-b border-opnskin-bg-secondary/40 hover:bg-opnskin-primary/10 transition-colors">
                <td className="py-3 px-4 flex items-center gap-2 font-bold">
                  <span className="text-xl">{row.icon}</span>
                  <Badge className="bg-black/60 border-opnskin-primary/40 text-opnskin-accent px-3 py-1 font-bold text-base">{row.level}</Badge>
                </td>
                <td className="py-3 px-4 font-mono text-opnskin-text-secondary">{typeof row.depense === 'number' ? (Math.round(row.depense * rate)).toLocaleString() + ' ' + symbol : '-'}</td>
                <td className="py-3 px-4 font-mono text-opnskin-accent text-lg font-bold">{row.fee}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Encadré Fast Sell */}
      <div className="mt-8 max-w-2xl mx-auto fast-sell-card bg-gradient-to-br from-opnskin-primary/10 to-opnskin-bg-secondary/40 border border-opnskin-primary/30 rounded-xl p-6 shadow-lg flex flex-col items-center">
        <h3 className="text-2xl mb-2 font-bold text-opnskin-accent">{t('fees.fast_sell_title', '💸 Vente rapide - 0% de frais')}</h3>
        <p className="text-center text-opnskin-text-secondary mb-2">
          {t('fees.fast_sell_desc', "Vendez instantanément vos skins à notre pool d'achat. Offre immédiate, sans attente.")}
        </p>
        <Badge className="bg-opnskin-primary/20 text-opnskin-primary border-opnskin-primary/40 px-4 py-2 text-lg font-bold mt-2">{t('fees.fast_sell_badge', '0% de frais')}</Badge>
      </div>
    </div>
  );
} 