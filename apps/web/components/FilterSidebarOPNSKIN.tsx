"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from 'next-i18next';

const WEAR = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];

// Mapping des raretés avec leurs couleurs
const RARITIES = [
  { name: "Consommateur", value: "consumer", color: "bg-gray-400" },
  { name: "Industriel", value: "industrial", color: "bg-blue-400" },
  { name: "Militaire", value: "milspec", color: "bg-blue-500" },
  { name: "Restreint", value: "restricted", color: "bg-purple-500" },
  { name: "Classé", value: "classified", color: "bg-pink-500" },
  { name: "Secret", value: "covert", color: "bg-red-500" },
  { name: "Extraordinaire", value: "exceedingly_rare", color: "bg-yellow-500" },
];

// Catégories d'armes organisées par groupes
const WEAPON_CATEGORIES = {
  "Rifles": ["AK-47", "M4A4", "M4A1-S", "AUG", "SG 553", "FAMAS", "Galil AR", "SCAR-20", "G3SG1", "SSG 08"],
  "Pistols": ["Desert Eagle", "USP-S", "Glock-18", "P250", "Tec-9", "Five-SeveN", "CZ75-Auto", "R8 Revolver", "Dual Berettas", "P2000"],
  "SMGs": ["MP9", "MAC-10", "MP7", "UMP-45", "P90", "PP-Bizon", "MP5-SD"],
  "Shotguns": ["Nova", "XM1014", "MAG-7", "Sawed-Off"],
  "Machineguns": ["M249", "Negev"],
  "Special": ["Knife", "Gloves", "Other"]
};

const TYPES = [
  "AK-47", "M4A4", "M4A1-S", "AWP", "Desert Eagle", "USP-S", "Glock-18", "P250", 
  "Tec-9", "Five-SeveN", "CZ75-Auto", "R8 Revolver", "Dual Berettas", "P2000",
  "SCAR-20", "G3SG1", "SSG 08", "AUG", "SG 553", "FAMAS", "Galil AR",
  "MP9", "MAC-10", "MP7", "UMP-45", "P90", "PP-Bizon", "MP5-SD",
  "Nova", "XM1014", "MAG-7", "Sawed-Off", "M249", "Negev",
  "Knife", "Gloves", "Other"
];

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

// Composant pour les filtres mobiles (drawer)
export function MobileFilters({
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
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.search,
    filters.wear.length,
    filters.rarity.length,
    filters.type.length,
    filters.stattrak,
    filters.collection,
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="lg:hidden flex items-center gap-2 border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
        >
          <Filter className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 bg-opnskin-primary text-white text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-opnskin-bg-card border-opnskin-bg-secondary">
        <SheetHeader>
          <SheetTitle className="text-opnskin-text-primary font-rajdhani">
            Filtres avancés
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <FilterContent 
            filters={filters} 
            setFilters={setFilters} 
            collections={collections} 
            showFloat={showFloat} 
            priceMax={priceMax}
            isMobile={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Composant pour les filtres desktop (sidebar)
export function DesktopFilters({
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
    <aside className="hidden lg:block w-80 max-w-full bg-[#181a20] rounded-2xl p-6 shadow-2xl flex flex-col gap-6 sticky top-24 border border-opnskin-primary/20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-rajdhani font-bold text-opnskin-text-primary tracking-wide">
          Filtres avancés
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setFilters(DEFAULT_OPNSKIN_FILTERS)}
          className="text-opnskin-text-secondary hover:text-opnskin-text-primary"
        >
          Réinitialiser
        </Button>
      </div>
      <FilterContent 
        filters={filters} 
        setFilters={setFilters} 
        collections={collections} 
        showFloat={showFloat} 
        priceMax={priceMax}
        isMobile={false}
      />
    </aside>
  );
}

// Composant pour afficher les filtres actifs
export function ActiveFilters({
  filters,
  setFilters,
}: {
  filters: OPNSKINFilters;
  setFilters: (f: OPNSKINFilters) => void;
}) {
  const { t } = useTranslation('common');
  
  const activeFilters = [
    ...(filters.search ? [{ type: 'search', label: `"${filters.search}"` }] : []),
    ...filters.wear.map(wear => ({ type: 'wear', label: wear })),
    ...filters.rarity.map(rarity => ({ 
      type: 'rarity', 
      label: RARITIES.find(r => r.value === rarity)?.name || rarity 
    })),
    ...filters.type.map(type => ({ type: 'type', label: type })),
    ...(filters.stattrak ? [{ type: 'stattrak', label: 'StatTrak™' }] : []),
    ...(filters.collection ? [{ type: 'collection', label: filters.collection }] : []),
  ];

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${index}`}
          variant="secondary"
          className="bg-opnskin-primary/20 text-opnskin-primary border-opnskin-primary/30 hover:bg-opnskin-primary/30"
        >
          {filter.label}
          <button
            onClick={() => {
              const newFilters = { ...filters };
              switch (filter.type) {
                case 'search':
                  newFilters.search = '';
                  break;
                case 'wear':
                  newFilters.wear = newFilters.wear.filter(w => w !== filter.label);
                  break;
                case 'rarity':
                  newFilters.rarity = newFilters.rarity.filter(r => r !== filter.label);
                  break;
                case 'type':
                  newFilters.type = newFilters.type.filter(t => t !== filter.label);
                  break;
                case 'stattrak':
                  newFilters.stattrak = null;
                  break;
                case 'collection':
                  newFilters.collection = '';
                  break;
              }
              setFilters(newFilters);
            }}
            className="ml-2 hover:text-opnskin-accent"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters(DEFAULT_OPNSKIN_FILTERS)}
        className="text-opnskin-text-secondary hover:text-opnskin-text-primary"
      >
        Effacer tout
      </Button>
    </div>
  );
}

// Composant pour la barre de catégories d'armes
export function WeaponCategoryBar({
  filters,
  setFilters,
}: {
  filters: OPNSKINFilters;
  setFilters: (f: OPNSKINFilters) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      // Si on clique sur la même catégorie, on la désélectionne
      setSelectedCategory(null);
      setFilters({ ...filters, type: [] });
    } else {
      // Sinon on sélectionne la nouvelle catégorie
      setSelectedCategory(category);
      const weaponsInCategory = WEAPON_CATEGORIES[category as keyof typeof WEAPON_CATEGORIES] || [];
      setFilters({ ...filters, type: weaponsInCategory });
    }
  };

  const handleWeaponClick = (weapon: string) => {
    const currentTypes = filters.type;
    if (currentTypes.includes(weapon)) {
      // Retirer l'arme
      const newTypes = currentTypes.filter(t => t !== weapon);
      setFilters({ ...filters, type: newTypes });
      // Si plus d'armes dans la catégorie, désélectionner la catégorie
      if (newTypes.length === 0) {
        setSelectedCategory(null);
      }
    } else {
      // Ajouter l'arme
      setFilters({ ...filters, type: [...currentTypes, weapon] });
    }
  };

  return (
    <div className="mb-6">
      {/* Barre des catégories principales */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(WEAPON_CATEGORIES).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "text-xs font-medium transition-all duration-150 hover:scale-105",
              selectedCategory === category 
                ? "bg-opnskin-primary text-white border-opnskin-primary shadow-lg shadow-opnskin-primary/20" 
                : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40 hover:text-opnskin-text-primary"
            )}
          >
            {category}
            {filters.type.length > 0 && selectedCategory === category && (
              <Badge className="ml-2 bg-white/20 text-white text-xs">
                {filters.type.length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Sous-catégories (armes spécifiques) */}
      {selectedCategory && (
        <div className="bg-opnskin-bg-secondary/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-opnskin-text-primary">
              {selectedCategory} - Sélectionnez les armes
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setFilters({ ...filters, type: [] });
              }}
              className="text-xs text-opnskin-text-secondary hover:text-opnskin-text-primary"
            >
              <X className="w-3 h-3 mr-1" />
              Fermer
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEAPON_CATEGORIES[selectedCategory as keyof typeof WEAPON_CATEGORIES]?.map((weapon) => (
              <Badge
                key={weapon}
                className={cn(
                  "cursor-pointer px-2 py-1 text-xs font-medium border transition-all duration-150 hover:scale-105",
                  filters.type.includes(weapon)
                    ? "bg-opnskin-primary text-white border-opnskin-primary/80 shadow-lg shadow-opnskin-primary/20" 
                    : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40 hover:text-opnskin-text-primary"
                )}
                onClick={() => handleWeaponClick(weapon)}
              >
                {weapon}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Contenu des filtres (partagé entre mobile et desktop)
function FilterContent({
  filters,
  setFilters,
  collections,
  showFloat = false,
  priceMax = 1000,
  isMobile = false,
}: {
  filters: OPNSKINFilters;
  setFilters: (f: OPNSKINFilters) => void;
  collections: string[];
  showFloat?: boolean;
  priceMax?: number;
  isMobile?: boolean;
}) {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-opnskin-text-primary text-sm">Recherche</span>
          <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Prix */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-opnskin-text-primary text-sm">Prix (€)</span>
          <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="text-xs text-opnskin-text-secondary mb-3">
            Prix: {filters.price[0]}€ - {filters.price[1]}€
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              min={0}
              max={filters.price[1]}
              value={filters.price[0]}
              onChange={e => {
                let min = Math.max(0, Math.min(Number(e.target.value), filters.price[1]));
                setFilters({ ...filters, price: [min, filters.price[1]] });
              }}
              className="w-20 rounded bg-opnskin-bg-card border px-2 py-1 text-sm text-opnskin-text-primary"
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
              className="w-20 rounded bg-opnskin-bg-card border px-2 py-1 text-sm text-opnskin-text-primary"
            />
          </div>
          <Slider
            min={0}
            max={priceMax}
            step={1}
            value={filters.price}
            onValueChange={vals => setFilters({ ...filters, price: vals as [number, number] })}
            className="mt-2"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Float (optionnel) */}
      {showFloat && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <span className="font-semibold text-opnskin-text-primary text-sm">Float</span>
            <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="text-xs text-opnskin-text-secondary mb-3">
              Float: {filters.float ? filters.float[0].toFixed(3) : '0.000'} - {filters.float ? filters.float[1].toFixed(3) : '1.000'}
            </div>
            <Slider
              min={0}
              max={1}
              step={0.001}
              value={filters.float || [0, 1]}
              onValueChange={vals => setFilters({ ...filters, float: vals as [number, number] })}
              className="mt-2"
            />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Rareté */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-opnskin-text-primary text-sm">Rareté</span>
          <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="flex flex-wrap gap-2">
            {RARITIES.map(rarity => (
              <Badge
                key={rarity.value}
                className={cn(
                  "cursor-pointer px-3 py-2 text-xs font-medium border transition-all duration-150 hover:scale-105",
                  filters.rarity.includes(rarity.value) 
                    ? `${rarity.color} text-white border-opacity-80 shadow-lg shadow-opacity-20` 
                    : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opacity-40 hover:text-opnskin-text-primary"
                )}
                onClick={() => setFilters({ 
                  ...filters, 
                  rarity: filters.rarity.includes(rarity.value) 
                    ? filters.rarity.filter(x => x !== rarity.value) 
                    : [...filters.rarity, rarity.value] 
                })}
              >
                {rarity.name}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* État (Wear) */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-opnskin-text-primary text-sm">État</span>
          <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="flex flex-wrap gap-2">
            {WEAR.map(wear => (
              <Badge
                key={wear}
                className={cn(
                  "cursor-pointer px-3 py-2 text-xs font-medium border transition-all duration-150 hover:scale-105",
                  filters.wear.includes(wear) 
                    ? "bg-opnskin-primary text-white border-opnskin-primary/80 shadow-lg shadow-opnskin-primary/20" 
                    : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40 hover:text-opnskin-text-primary"
                )}
                onClick={() => setFilters({ 
                  ...filters, 
                  wear: filters.wear.includes(wear) 
                    ? filters.wear.filter(x => x !== wear) 
                    : [...filters.wear, wear] 
                })}
              >
                {wear}
              </Badge>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* StatTrak */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-opnskin-text-primary text-sm">StatTrak™</span>
          <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn(
                "cursor-pointer px-3 py-2 text-xs font-medium border transition-all duration-150 hover:scale-105",
                filters.stattrak === true
                  ? "bg-opnskin-primary text-white border-opnskin-primary/80 shadow-lg shadow-opnskin-primary/20" 
                  : "bg-opnskin-bg-card text-opnskin-text-secondary border-opnskin-bg-secondary/60 hover:border-opnskin-primary/40 hover:text-opnskin-text-primary"
              )}
              onClick={() => setFilters({ 
                ...filters, 
                stattrak: filters.stattrak === true ? null : true 
              })}
            >
              StatTrak™ uniquement
            </Badge>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Collection */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-opnskin-text-primary text-sm">Collection</span>
          <ChevronDown className="w-4 h-4 text-opnskin-text-secondary" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Composant principal (export par défaut pour compatibilité)
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
    <>
      <MobileFilters 
        filters={filters} 
        setFilters={setFilters} 
        collections={collections} 
        showFloat={showFloat} 
        priceMax={priceMax}
      />
      <DesktopFilters 
        filters={filters} 
        setFilters={setFilters} 
        collections={collections} 
        showFloat={showFloat} 
        priceMax={priceMax}
      />
    </>
  );
} 