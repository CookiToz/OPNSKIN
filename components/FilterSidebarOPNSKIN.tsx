"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const WEAR = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
const RARITIES = ["Consumer", "Industrial", "Mil-Spec", "Restricted", "Classified", "Covert", "Contraband"];
const TYPES = ["Rifle", "Pistol", "SMG", "Knife", "Gloves", "Sniper", "Shotgun", "Machinegun"];

export type OPNSKINFilters = {
  search: string;
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
  search: "",
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
  return (
    <aside className="w-80 max-w-full bg-[#181a20] rounded-2xl p-6 shadow-2xl flex flex-col gap-6 sticky top-24 border border-opnskin-primary/20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-rajdhani font-bold text-opnskin-accent tracking-wide">Filtres avancés</h2>
        <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_OPNSKIN_FILTERS)}>
          Réinitialiser
        </Button>
      </div>

      {/* Barre de recherche */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">Recherche</div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-opnskin-text-secondary" />
          <Input
            type="text"
            placeholder="Rechercher un skin..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 bg-opnskin-bg-card border-opnskin-bg-secondary text-opnskin-text-primary placeholder:text-opnskin-text-secondary"
          />
        </div>
      </div>

      {/* Prix */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">Prix (€)</div>
        <div className="text-xs text-opnskin-text-secondary mb-2">Prix: {filters.price[0]}€ - {filters.price[1]}€</div>
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
            className="w-20 rounded bg-opnskin-bg-card border px-2 py-1 text-sm"
          />
          <span className="text-opnskin-text-secondary">-</span>
          <input
            type="number"
            min={filters.price[0]}
            max={priceMax}
            value={filters.price[1]}
            onChange={e => {
              let max = Math.max(filters.price[0], Math.min(Number(e.target.value), priceMax));
              setFilters({ ...filters, price: [filters.price[0], max] });
            }}
            className="w-20 rounded bg-opnskin-bg-card border px-2 py-1 text-sm"
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
            background: `linear-gradient(90deg, #181a20 0%, #181a20 ${(filters.price[1] / priceMax) * 100}%, #00ffe7 ${(filters.price[1] / priceMax) * 100}%, #00ffe7 100%)`,
            borderRadius: '8px',
            height: '8px',
          }}
        />
      </div>

      {/* Float (optionnel) */}
      {showFloat && (
        <div>
          <div className="font-semibold mb-2 text-opnskin-text-secondary">Float</div>
          <div className="text-xs text-opnskin-text-secondary mb-2">
            Float: {filters.float ? filters.float[0].toFixed(3) : '0.000'} - {filters.float ? filters.float[1].toFixed(3) : '1.000'}
          </div>
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={filters.float || [0, 1]}
            onValueChange={vals => setFilters({ ...filters, float: vals as [number, number] })}
            className="mt-2"
            style={{
              background: `linear-gradient(90deg, #181a20 0%, #181a20 ${((filters.float ? filters.float[1] : 1) / 1) * 100}%, #00ffe7 ${((filters.float ? filters.float[1] : 1) / 1) * 100}%, #00ffe7 100%)`,
              borderRadius: '8px',
              height: '8px',
            }}
          />
        </div>
      )}

      {/* StatTrak - Case à cocher */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">StatTrak™</div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="stattrak"
            checked={filters.stattrak === true}
            onCheckedChange={(checked) => setFilters({ ...filters, stattrak: checked ? true : null })}
            className="border-opnskin-bg-secondary data-[state=checked]:bg-opnskin-primary data-[state=checked]:border-opnskin-primary"
          />
          <label htmlFor="stattrak" className="text-sm text-opnskin-text-secondary cursor-pointer">
            StatTrak™ uniquement
          </label>
        </div>
      </div>

      {/* État (Wear) */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">État</div>
        <div className="flex flex-wrap gap-2">
          {WEAR.map(w => (
            <Badge
              key={w}
              className={cn(
                "cursor-pointer px-3 py-1 text-xs font-bold border transition-all duration-150 hover:scale-105",
                filters.wear.includes(w) 
                  ? "bg-opnskin-primary text-white border-opnskin-primary/80 shadow-lg shadow-opnskin-primary/20" 
                  : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40"
              )}
              onClick={() => setFilters({ ...filters, wear: filters.wear.includes(w) ? filters.wear.filter(x => x !== w) : [...filters.wear, w] })}
            >
              {w}
            </Badge>
          ))}
        </div>
      </div>

      {/* Rareté */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">Rareté</div>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map(r => (
            <Badge
              key={r}
              className={cn(
                "cursor-pointer px-3 py-1 text-xs font-bold border transition-all duration-150 hover:scale-105",
                filters.rarity.includes(r) 
                  ? "bg-opnskin-primary text-white border-opnskin-primary/80 shadow-lg shadow-opnskin-primary/20" 
                  : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40"
              )}
              onClick={() => setFilters({ ...filters, rarity: filters.rarity.includes(r) ? filters.rarity.filter(x => x !== r) : [...filters.rarity, r] })}
            >
              {r}
            </Badge>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">Type</div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <Badge
              key={t}
              className={cn(
                "cursor-pointer px-3 py-1 text-xs font-bold border transition-all duration-150 hover:scale-105",
                filters.type.includes(t) 
                  ? "bg-opnskin-primary text-white border-opnskin-primary/80 shadow-lg shadow-opnskin-primary/20" 
                  : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40"
              )}
              onClick={() => setFilters({ ...filters, type: filters.type.includes(t) ? filters.type.filter(x => x !== t) : [...filters.type, t] })}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Collection */}
      <div>
        <div className="font-semibold mb-2 text-opnskin-text-secondary">Collection</div>
        <select
          className="w-full rounded bg-opnskin-bg-card border border-opnskin-bg-secondary px-3 py-2 text-opnskin-text-primary"
          value={filters.collection}
          onChange={e => setFilters({ ...filters, collection: e.target.value })}
        >
          <option value="">Toutes les collections</option>
          {collections.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </aside>
  );
} 