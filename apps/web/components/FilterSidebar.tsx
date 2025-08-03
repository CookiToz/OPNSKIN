"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CS2_WEAR = [
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred",
];
const CS2_RARITY = [
  "Consumer",
  "Industrial",
  "Mil-Spec",
  "Restricted",
  "Classified",
  "Covert",
  "Contraband",
];
const CS2_TYPE = [
  "Rifle",
  "Pistol",
  "SMG",
  "Knife",
  "Gloves",
  "Sniper",
  "Shotgun",
  "Machinegun",
];

export type CS2Filters = {
  priceMin: number;
  priceMax: number;
  wear: string[];
  rarity: string[];
  type: string[];
  stattrak: boolean | null;
  collection: string;
  tradeHold: boolean | null;
};

const DEFAULT_FILTERS: CS2Filters = {
  priceMin: 0,
  priceMax: 1000,
  wear: [],
  rarity: [],
  type: [],
  stattrak: null,
  collection: "",
  tradeHold: null,
};

export { DEFAULT_FILTERS };

export default function FilterSidebarCS2({
  filters,
  setFilters,
  collections,
}: {
  filters: CS2Filters;
  setFilters: (f: CS2Filters) => void;
  collections: string[];
}) {
  // Résumé des filtres actifs
  const activeBadges = [
    ...filters.wear.map((w) => ({ label: w, onRemove: () => setFilters({ ...filters, wear: filters.wear.filter((x) => x !== w) }) })),
    ...filters.rarity.map((r) => ({ label: r, onRemove: () => setFilters({ ...filters, rarity: filters.rarity.filter((x) => x !== r) }) })),
    ...filters.type.map((t) => ({ label: t, onRemove: () => setFilters({ ...filters, type: filters.type.filter((x) => x !== t) }) })),
    ...(filters.stattrak !== null ? [{ label: "StatTrak™", onRemove: () => setFilters({ ...filters, stattrak: null }) }] : []),
    ...(filters.tradeHold !== null ? [{ label: filters.tradeHold ? "Trade Hold" : "Échangeable", onRemove: () => setFilters({ ...filters, tradeHold: null }) }] : []),
    ...(filters.collection ? [{ label: filters.collection, onRemove: () => setFilters({ ...filters, collection: "" }) }] : []),
    ...(filters.priceMin > 0 || filters.priceMax < 1000 ? [{ label: `Prix: ${filters.priceMin}€ - ${filters.priceMax}€`, onRemove: () => setFilters({ ...filters, priceMin: 0, priceMax: 1000 }) }] : []),
  ];

  return (
    <aside className="w-72 bg-opnskin-bg-secondary rounded-xl p-6 shadow-xl flex flex-col gap-6 sticky top-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-opnskin-accent">Filtres avancés</h2>
        <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
          Réinitialiser
        </Button>
      </div>
      {/* Résumé des filtres actifs */}
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {activeBadges.map((b, i) => (
            <Badge key={i} className="bg-opnskin-violet/80 text-white cursor-pointer" onClick={b.onRemove}>{b.label} ✕</Badge>
          ))}
        </div>
      )}
      {/* Prix */}
      <div>
        <div className="font-semibold mb-1">Prix (€)</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={filters.priceMax}
            value={filters.priceMin}
            onChange={e => setFilters({ ...filters, priceMin: Number(e.target.value) })}
            className="w-20 rounded bg-opnskin-bg-card border px-2 py-1"
          />
          <span>-</span>
          <input
            type="number"
            min={filters.priceMin}
            max={10000}
            value={filters.priceMax}
            onChange={e => setFilters({ ...filters, priceMax: Number(e.target.value) })}
            className="w-20 rounded bg-opnskin-bg-card border px-2 py-1"
          />
        </div>
      </div>
      {/* État (Wear) */}
      <div>
        <div className="font-semibold mb-1">État</div>
        <div className="flex flex-wrap gap-2">
          {CS2_WEAR.map(w => (
            <Badge
              key={w}
              className={cn("cursor-pointer px-3 py-1", filters.wear.includes(w) ? "bg-opnskin-violet text-white" : "bg-opnskin-bg-card text-opnskin-text-secondary")}
              onClick={() => setFilters({ ...filters, wear: filters.wear.includes(w) ? filters.wear.filter(x => x !== w) : [...filters.wear, w] })}
            >
              {w}
            </Badge>
          ))}
        </div>
      </div>
      {/* Rareté */}
      <div>
        <div className="font-semibold mb-1">Rareté</div>
        <div className="flex flex-wrap gap-2">
          {CS2_RARITY.map(r => (
            <Badge
              key={r}
              className={cn("cursor-pointer px-3 py-1", filters.rarity.includes(r) ? "bg-opnskin-violet text-white" : "bg-opnskin-bg-card text-opnskin-text-secondary")}
              onClick={() => setFilters({ ...filters, rarity: filters.rarity.includes(r) ? filters.rarity.filter(x => x !== r) : [...filters.rarity, r] })}
            >
              {r}
            </Badge>
          ))}
        </div>
      </div>
      {/* Type */}
      <div>
        <div className="font-semibold mb-1">Type</div>
        <div className="flex flex-wrap gap-2">
          {CS2_TYPE.map(t => (
            <Badge
              key={t}
              className={cn("cursor-pointer px-3 py-1", filters.type.includes(t) ? "bg-opnskin-violet text-white" : "bg-opnskin-bg-card text-opnskin-text-secondary")}
              onClick={() => setFilters({ ...filters, type: filters.type.includes(t) ? filters.type.filter(x => x !== t) : [...filters.type, t] })}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
      {/* StatTrak */}
      <div>
        <div className="font-semibold mb-1">StatTrak™</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filters.stattrak === true ? "default" : "outline"}
            className={filters.stattrak === true ? "bg-opnskin-violet text-white" : ""}
            onClick={() => setFilters({ ...filters, stattrak: filters.stattrak === true ? null : true })}
          >
            Oui
          </Button>
          <Button
            size="sm"
            variant={filters.stattrak === false ? "default" : "outline"}
            className={filters.stattrak === false ? "bg-opnskin-violet text-white" : ""}
            onClick={() => setFilters({ ...filters, stattrak: filters.stattrak === false ? null : false })}
          >
            Non
          </Button>
        </div>
      </div>
      {/* Collection */}
      <div>
        <div className="font-semibold mb-1">Collection</div>
        <select
          className="w-full rounded bg-opnskin-bg-card border px-2 py-1"
          value={filters.collection}
          onChange={e => setFilters({ ...filters, collection: e.target.value })}
        >
          <option value="">Toutes</option>
          {collections.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {/* Trade Hold */}
      <div>
        <div className="font-semibold mb-1">Trade Hold</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filters.tradeHold === true ? "default" : "outline"}
            className={filters.tradeHold === true ? "bg-opnskin-violet text-white" : ""}
            onClick={() => setFilters({ ...filters, tradeHold: filters.tradeHold === true ? null : true })}
          >
            Oui
          </Button>
          <Button
            size="sm"
            variant={filters.tradeHold === false ? "default" : "outline"}
            className={filters.tradeHold === false ? "bg-opnskin-violet text-white" : ""}
            onClick={() => setFilters({ ...filters, tradeHold: filters.tradeHold === false ? null : false })}
          >
            Non
          </Button>
        </div>
      </div>
    </aside>
  );
}
