import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '../inventory/types';
import { getWeaponCategory, getWeaponWear } from '../inventory/utils';
import { RefreshCw, Filter, X } from 'lucide-react';

interface InventoryFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const RARITIES = [
  { key: 'consumer', label: 'Consommateur', color: 'bg-gray-500' },
  { key: 'industrial', label: 'Industriel', color: 'bg-blue-500' },
  { key: 'milspec', label: 'Militaire', color: 'bg-green-500' },
  { key: 'restricted', label: 'Restreint', color: 'bg-purple-500' },
  { key: 'classified', label: 'Classifié', color: 'bg-pink-500' },
  { key: 'covert', label: 'Covert', color: 'bg-red-500' },
  { key: 'exceedingly_rare', label: 'Exceedingly Rare', color: 'bg-yellow-500' },
];

const WEAR_LEVELS = [
  { key: 'wear_factory_new', label: 'Factory New' },
  { key: 'wear_minimal_wear', label: 'Minimal Wear' },
  { key: 'wear_field_tested', label: 'Field-Tested' },
  { key: 'wear_well_worn', label: 'Well-Worn' },
  { key: 'wear_battle_scarred', label: 'Battle-Scarred' },
];

const WEAPON_TYPES = [
  'AK-47', 'M4A1', 'M4A4', 'AWP', 'Glock', 'USP', 'P250', 
  'Desert Eagle', 'MP7', 'P90', 'Nova', 'XM1014', 'MAG-7', 'Negev'
];

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isLoading,
}) => {
  const toggleFilter = (type: keyof FilterState, value: string) => {
    if (type === 'rarity' || type === 'wear' || type === 'type') {
      const currentFilters = filters[type] as string[];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(f => f !== value)
        : [...currentFilters, value];
      
      onFilterChange({
        ...filters,
        [type]: newFilters,
      });
    }
  };

  const toggleStatTrak = (showStatTrak: boolean) => {
    onFilterChange({
      ...filters,
      showStatTrak,
      showNonStatTrak: !showStatTrak,
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.rarity.length > 0 ||
    filters.wear.length > 0 ||
    filters.type.length > 0 ||
    filters.showStatTrak ||
    filters.showNonStatTrak;

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Input
          placeholder="Rechercher un skin..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-opnskin-text-secondary" />
      </div>

      {/* Filtres de rareté */}
      <div>
        <h3 className="text-sm font-medium text-opnskin-text-primary mb-2">Rareté</h3>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map((rarity) => (
            <Badge
              key={rarity.key}
              variant={filters.rarity.includes(rarity.key) ? 'default' : 'outline'}
              className={`cursor-pointer ${rarity.color}`}
              onClick={() => toggleFilter('rarity', rarity.key)}
            >
              {rarity.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtres d'usure */}
      <div>
        <h3 className="text-sm font-medium text-opnskin-text-primary mb-2">État</h3>
        <div className="flex flex-wrap gap-2">
          {WEAR_LEVELS.map((wear) => (
            <Badge
              key={wear.key}
              variant={filters.wear.includes(wear.key) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleFilter('wear', wear.key)}
            >
              {wear.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtres de type d'arme */}
      <div>
        <h3 className="text-sm font-medium text-opnskin-text-primary mb-2">Type d'arme</h3>
        <div className="flex flex-wrap gap-2">
          {WEAPON_TYPES.map((type) => (
            <Badge
              key={type}
              variant={filters.type.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleFilter('type', type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filtres StatTrak */}
      <div>
        <h3 className="text-sm font-medium text-opnskin-text-primary mb-2">StatTrak</h3>
        <div className="flex gap-2">
          <Badge
            variant={filters.showStatTrak ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatTrak(true)}
          >
            StatTrak uniquement
          </Badge>
          <Badge
            variant={filters.showNonStatTrak ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatTrak(false)}
          >
            Non-StatTrak uniquement
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
  );
}; 