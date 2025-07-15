"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const WEAR = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
const RARITIES = ["Consumer", "Industrial", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"];
const TYPES = ["Rifle", "Pistol", "SMG", "Knife", "Gloves", "Sniper", "Shotgun", "Machinegun"];

export type OPNSKINFilters = {
  price: [number, number];
  float?: [number, number];
  wear: string[];
  rarity: string[];
  type: string[];
  stattrak: boolean | null;
  collection: string;
  tradeHold: boolean | null;
};

export const DEFAULT_OPNSKIN_FILTERS: OPNSKINFilters = {
  price: [0, 1000],
  float: [0, 1],
  wear: [],
  rarity: [],
  type: [],
  stattrak: null,
  collection: "",
  tradeHold: null,
};

export default function FilterSidebarOPNSKIN({
  filters,
  setFilters,
  collections,
  showFloat = false,
  priceMax = 1000,
}: {
  filters: OPNSKINFilters;
  setFilters: (f: OPNSKINFilters) => void;
  collections: string[];
  showFloat?: boolean;
  priceMax?: number;
}) {
  // Filtres actifs (badges closables)
  const activeBadges = [
    ...filters.wear.map((w) => ({ label: w, onRemove: () => setFilters({ ...filters, wear: filters.wear.filter((x) => x !== w) }) })),
    ...filters.rarity.map((r) => ({ label: r, onRemove: () => setFilters({ ...filters, rarity: filters.rarity.filter((x) => x !== r) }) })),
    ...filters.type.map((t) => ({ label: t, onRemove: () => setFilters({ ...filters, type: filters.type.filter((x) => x !== t) }) })),
    ...(filters.stattrak !== null ? [{ label: "StatTrak™", onRemove: () => setFilters({ ...filters, stattrak: null }) }] : []),
    ...(filters.tradeHold !== null ? [{ label: filters.tradeHold ? "Trade Hold" : "Échangeable", onRemove: () => setFilters({ ...filters, tradeHold: null }) }] : []),
    ...(filters.collection ? [{ label: filters.collection, onRemove: () => setFilters({ ...filters, collection: "" }) }] : []),
    ...((filters.price[0] > 0 || filters.price[1] < 1000) ? [{ label: `Prix: ${filters.price[0]}€ - ${filters.price[1]}€`, onRemove: () => setFilters({ ...filters, price: [0, 1000] }) }] : []),
    ...(showFloat && (filters.float && (filters.float[0] > 0 || filters.float[1] < 1)) ? [{ label: `Float: ${filters.float[0]} - ${filters.float[1]}`, onRemove: () => setFilters({ ...filters, float: [0, 1] }) }] : []),
  ];

  return (
    <aside className="w-80 max-w-full bg-[#101c2c] rounded-3xl p-7 shadow-2xl flex flex-col gap-8 sticky top-24 border border-[#00ffe7]/40 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-rajdhani font-bold text-[#00ffe7] drop-shadow-[0_0_8px_#00ffe7] tracking-wide">Filtres avancés</h2>
        <Button variant="ghost" size="sm" className="text-[#00ffe7] hover:bg-[#00ffe7]/10 font-bold" onClick={() => setFilters(DEFAULT_OPNSKIN_FILTERS)}>
          Réinitialiser
        </Button>
      </div>
      {/* Résumé des filtres actifs */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {activeBadges.map((b, i) => (
            <Badge key={i} className={cn(
              b.label.includes('StatTrak') ? 'bg-[#00c97b]/90 text-white shadow-[0_0_8px_#00c97b]' : 'bg-[#287CFA]/90 text-white shadow-[0_0_8px_#00ffe7]',
              'cursor-pointer font-bold px-3 py-1 rounded-lg text-xs border border-[#00ffe7]/30 hover:scale-105 transition')}
              onClick={b.onRemove}>{b.label} ✕</Badge>
          ))}
        </div>
      )}
      {/* Prix */}
      <div>
        <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">Prix (€)</div>
        <div className="text-xs text-[#00ffe7]/80 mb-1">Prix: {filters.price[0]}€ - {filters.price[1]}€</div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            min={0}
            max={filters.price[1]}
            value={filters.price[0]}
            onChange={e => {
              let min = Math.max(0, Math.min(Number(e.target.value), filters.price[1]));
              setFilters({ ...filters, price: [min, filters.price[1]] });
            }}
            className="w-20 rounded-lg bg-[#181a20] border border-[#00ffe7]/30 px-2 py-1 text-[#00ffe7] font-bold shadow-inner"
          />
          <span className="text-[#00ffe7]/60">-</span>
          <input
            type="number"
            min={filters.price[0]}
            max={priceMax}
            value={filters.price[1]}
            onChange={e => {
              let max = Math.max(filters.price[0], Math.min(Number(e.target.value), priceMax));
              setFilters({ ...filters, price: [filters.price[0], max] });
            }}
            className="w-20 rounded-lg bg-[#181a20] border border-[#00ffe7]/30 px-2 py-1 text-[#00ffe7] font-bold shadow-inner"
          />
        </div>
        <Slider
          min={0}
          max={priceMax}
          step={1}
          value={filters.price}
          onValueChange={vals => setFilters({ ...filters, price: vals as [number, number] })}
          className="mt-2"
          style={{
            background: `linear-gradient(90deg, #101c2c 0%, #101c2c ${(filters.price[1] / priceMax) * 100}%, #00ffe7 ${(filters.price[1] / priceMax) * 100}%, #00ffe7 100%)`,
            borderRadius: '8px',
            height: '8px',
          }}
        />
      </div>
      {/* Float (optionnel) */}
      {showFloat && (
        <div>
          <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">Float</div>
          <div className="text-xs text-[#00ffe7]/80 mb-1">Float: {filters.float ? filters.float[0] : 0} - {filters.float ? filters.float[1] : 1}</div>
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={filters.float || [0, 1]}
            onValueChange={vals => setFilters({ ...filters, float: vals as [number, number] })}
            className="mt-2"
            style={{
              background: `linear-gradient(90deg, #101c2c 0%, #101c2c ${((filters.float ? filters.float[1] : 1) / 1) * 100}%, #00ffe7 ${((filters.float ? filters.float[1] : 1) / 1) * 100}%, #00ffe7 100%)`,
              borderRadius: '8px',
              height: '8px',
            }}
          />
        </div>
      )}
      {/* État (Wear) */}
      <div>
        <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">État</div>
        <div className="flex flex-wrap gap-2">
          {WEAR.map(w => (
            <Badge
              key={w}
              className={cn(
                filters.wear.includes(w)
                  ? 'bg-[#287CFA] text-white border border-[#00ffe7]/40 shadow-[0_0_8px_#00ffe7]'
                  : 'bg-[#181a20] text-[#00ffe7]/70 border border-[#00ffe7]/10',
                'cursor-pointer px-3 py-1 text-xs font-bold rounded-lg transition-all duration-150 hover:scale-105')}
              onClick={() => setFilters({ ...filters, wear: filters.wear.includes(w) ? filters.wear.filter(x => x !== w) : [...filters.wear, w] })}
            >
              {w}
            </Badge>
          ))}
        </div>
      </div>
      {/* Rareté */}
      <div>
        <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">Rareté</div>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map(r => (
            <Badge
              key={r}
              className={cn(
                filters.rarity.includes(r)
                  ? 'bg-[#287CFA] text-white border border-[#00ffe7]/40 shadow-[0_0_8px_#00ffe7]'
                  : 'bg-[#181a20] text-[#00ffe7]/70 border border-[#00ffe7]/10',
                'cursor-pointer px-3 py-1 text-xs font-bold rounded-lg transition-all duration-150 hover:scale-105')}
              onClick={() => setFilters({ ...filters, rarity: filters.rarity.includes(r) ? filters.rarity.filter(x => x !== r) : [...filters.rarity, r] })}
            >
              {r}
            </Badge>
          ))}
        </div>
      </div>
      {/* Type */}
      <div>
        <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">Type</div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <Badge
              key={t}
              className={cn(
                filters.type.includes(t)
                  ? 'bg-[#287CFA] text-white border border-[#00ffe7]/40 shadow-[0_0_8px_#00ffe7]'
                  : 'bg-[#181a20] text-[#00ffe7]/70 border border-[#00ffe7]/10',
                'cursor-pointer px-3 py-1 text-xs font-bold rounded-lg transition-all duration-150 hover:scale-105')}
              onClick={() => setFilters({ ...filters, type: filters.type.includes(t) ? filters.type.filter(x => x !== t) : [...filters.type, t] })}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
      {/* StatTrak */}
      <div>
        <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">StatTrak™</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filters.stattrak === true ? "default" : "outline"}
            className={filters.stattrak === true ? "bg-[#00c97b] text-white border border-[#00ffe7]/40 shadow-[0_0_8px_#00c97b] font-bold" : "border border-[#00ffe7]/20 text-[#00ffe7] font-bold"}
            onClick={() => setFilters({ ...filters, stattrak: filters.stattrak === true ? null : true })}
          >
            Oui
          </Button>
          <Button
            size="sm"
            variant={filters.stattrak === false ? "default" : "outline"}
            className={filters.stattrak === false ? "bg-[#287CFA] text-white border border-[#00ffe7]/40 shadow-[0_0_8px_#00ffe7] font-bold" : "border border-[#00ffe7]/20 text-[#00ffe7] font-bold"}
            onClick={() => setFilters({ ...filters, stattrak: filters.stattrak === false ? null : false })}
          >
            Non
          </Button>
        </div>
      </div>
      {/* Collection */}
      <div>
        <div className="font-semibold mb-1 text-[#00ffe7] text-lg font-rajdhani drop-shadow-[0_0_4px_#00ffe7]">Collection</div>
        <select
          className="w-full rounded-lg bg-[#181a20] border border-[#00ffe7]/30 px-2 py-1 text-[#00ffe7] font-bold shadow-inner"
          value={filters.collection}
          onChange={e => setFilters({ ...filters, collection: e.target.value })}
        >
          <option value="">Toutes</option>
          {collections.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </aside>
  );
} 