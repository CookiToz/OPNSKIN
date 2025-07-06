'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter } from "lucide-react";
import { useState } from "react";
import PriceSlider from './PriceSlider';
import FloatSlider from './FloatSlider';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatPrice, convertCurrency } from '@/lib/utils';

type Props = {
  onApply: (filters: any) => void;
  onReset: () => void;
};

export function FilterSidebar({ onApply, onReset }: Props) {
  const [filters, setFilters] = useState({
    category: 'all',
    rarity: 'all',
    exterior: 'all',
    stattrak: false,
    souvenir: false,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [floatRange, setFloatRange] = useState<[number, number]>([0, 1]);

  const currency = useCurrencyStore((state) => state.currency);

  const update = (key: string, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="terminal-bg rounded-lg p-4 w-full lg:w-[280px] border border-opnskin-bg-secondary">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-satoshi-bold text-lg text-opnskin-text-primary">Filtres</h2>
        <Button variant="ghost" size="sm" className="text-opnskin-text-secondary hover:text-opnskin-text-primary" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>

      <div className="space-y-6">
        {/* Catégorie */}
        <div>
          <label className="text-sm text-opnskin-text-secondary mb-2 block">Catégorie</label>
          <Select value={filters.category} onValueChange={(v) => update('category', v)}>
            <SelectTrigger className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="rifles">Fusils</SelectItem>
              <SelectItem value="pistols">Pistolets</SelectItem>
              <SelectItem value="knives">Couteaux</SelectItem>
              <SelectItem value="gloves">Gants</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rareté */}
        <div>
          <label className="text-sm text-opnskin-text-secondary mb-2 block">Rareté</label>
          <Select value={filters.rarity} onValueChange={(v) => update('rarity', v)}>
            <SelectTrigger className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <SelectItem value="all">Toutes les raretés</SelectItem>
              <SelectItem value="Consumer Grade">Consumer</SelectItem>
              <SelectItem value="Industrial Grade">Industrial</SelectItem>
              <SelectItem value="Mil-Spec Grade">Mil-Spec</SelectItem>
              <SelectItem value="Restricted">Restricted</SelectItem>
              <SelectItem value="Classified">Classified</SelectItem>
              <SelectItem value="Covert">Covert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Extérieur */}
        <div>
          <label className="text-sm text-opnskin-text-secondary mb-2 block">Extérieur</label>
          <Select value={filters.exterior} onValueChange={(v) => update('exterior', v)}>
            <SelectTrigger className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
              <SelectItem value="all">Tous les extérieurs</SelectItem>
              <SelectItem value="Factory New">Factory New</SelectItem>
              <SelectItem value="Minimal Wear">Minimal Wear</SelectItem>
              <SelectItem value="Field-Tested">Field-Tested</SelectItem>
              <SelectItem value="Well-Worn">Well-Worn</SelectItem>
              <SelectItem value="Battle-Scarred">Battle-Scarred</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prix */}
        <div>
          <label className="text-sm text-opnskin-text-secondary mb-2 block">Prix</label>
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              placeholder="Min"
              className="w-1/2 bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              suffix={currency}
            />
            <Input
              type="number"
              placeholder="Max"
              className="w-1/2 bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              suffix={currency}
            />
          </div>
          <PriceSlider
            values={priceRange}
            onChange={(vals) => setPriceRange(vals as [number, number])}
            min={0}
            max={100000}
            step={1}
            unit={currency}
            />
        </div>

        {/* Float */}
        <div>
          <label className="text-sm text-opnskin-text-secondary mb-2 block">Float</label>
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              placeholder="Min"
              className="w-1/2 bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary"
              value={floatRange[0]}
              onChange={(e) =>
                setFloatRange([parseFloat(e.target.value), floatRange[1]])
              }
            />
            <Input
              type="number"
              placeholder="Max"
              className="w-1/2 bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-secondary"
              value={floatRange[1]}
              onChange={(e) =>
                setFloatRange([floatRange[0], parseFloat(e.target.value)])
              }
            />
          </div>
          <FloatSlider
                values={floatRange}
                onChange={(v) => setFloatRange(v as [number, number])}
            />
        </div>

        {/* Options */}
        <div>
          <label className="text-sm text-opnskin-text-secondary mb-2 block">Options</label>
          <div className="flex flex-col gap-2 text-opnskin-text-primary text-sm">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={filters.stattrak}
                onChange={(e) => update('stattrak', e.target.checked)}
                className="accent-opnskin-primary"
              />
              StatTrak™
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={filters.souvenir}
                onChange={(e) => update('souvenir', e.target.checked)}
                className="accent-opnskin-primary"
              />
              Souvenir
            </label>
          </div>
        </div>

        {/* Appliquer */}
        <Button
          className="btn-opnskin w-full mt-2"
          onClick={() =>
            onApply({
              ...filters,
              minPrice: convertCurrency(priceRange[0], currency, 'EUR'),
              maxPrice: convertCurrency(priceRange[1], currency, 'EUR'),
              minFloat: floatRange[0],
              maxFloat: floatRange[1],
            })
          }
        >
          Appliquer les filtres
        </Button>
      </div>
    </div>
  );
}
