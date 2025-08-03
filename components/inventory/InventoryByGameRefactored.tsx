'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'next-i18next';
import { useInventory } from "@/components/InventoryProvider";
import { useFloat } from "@/components/FloatProvider";
import SkinCard from '@/components/SkinCard';
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { useSearchStore } from '@/hooks/use-search-store';

// Types et utilitaires
import { 
  GameType, 
  InventoryItem, 
  InventoryByGameProps, 
  FilterState 
} from './types';
import { 
  getWeaponCategory, 
  getWeaponWear, 
  rarityKeyMap 
} from './utils';

// Composants
import { SellDialog } from '../selling/SellDialog';
import { InventoryFilters } from '../filters/InventoryFilters';
import { useSelling } from '../selling/useSelling';

export default function InventoryByGameRefactored({ game, onBack }: InventoryByGameProps) {
  const { t } = useTranslation('common');
  const [hasRequestedLoad, setHasRequestedLoad] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<InventoryItem | null>(null);
  
  // Hook de vente
  const {
    selectedItem,
    sellDialogOpen,
    sellPrice,
    isSelling,
    setSellPrice,
    handleSell,
    handleSellConfirm,
    closeSellDialog,
  } = useSelling();

  // État des filtres
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    rarity: [],
    wear: [],
    type: [],
    priceRange: [0, 10000],
    showStatTrak: false,
    showNonStatTrak: false,
  });

  // Hook d'inventaire
  const { items, isLoading, isError, errorMsg, refetch } = useInventory(
    hasRequestedLoad ? (game?.appid ? String(game.appid) : undefined) : undefined
  );

  // Hook de recherche
  const { setSearchQuery } = useSearchStore();

  // Hook de float
  const { getFloatValue } = useFloat();

  // Charger l'inventaire au montage
  useEffect(() => {
    if (game?.appid) {
      setHasRequestedLoad(true);
    }
  }, [game?.appid]);

  // Filtrer les items
  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      const itemNameLower = item.name.toLowerCase();
      const searchLower = filters.search.toLowerCase();

      // Filtre de recherche
      if (filters.search && !itemNameLower.includes(searchLower)) {
        return false;
      }

      // Filtre de rareté
      if (filters.rarity.length > 0) {
        const itemRarity = rarityKeyMap[item.rarityCode || ''] || '';
        if (!filters.rarity.includes(itemRarity)) {
          return false;
        }
      }

      // Filtre d'usure
      if (filters.wear.length > 0) {
        const itemWear = getWeaponWear(item.name);
        if (!filters.wear.includes(itemWear)) {
          return false;
        }
      }

      // Filtre de type d'arme
      if (filters.type.length > 0) {
        const itemType = getWeaponCategory(item.name);
        if (!filters.type.includes(itemType)) {
          return false;
        }
      }

      // Filtre StatTrak
      if (filters.showStatTrak && !itemNameLower.includes('stattrak')) {
        return false;
      }
      if (filters.showNonStatTrak && itemNameLower.includes('stattrak')) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  // Gestionnaires d'événements
  const handleRefreshInventory = () => {
    setHasRequestedLoad(true);
    refetch();
  };

  const handleDetails = (item: InventoryItem) => {
    setSelectedItemForDetails(item);
    setDetailsDialogOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      rarity: [],
      wear: [],
      type: [],
      priceRange: [0, 10000],
      showStatTrak: false,
      showNonStatTrak: false,
    });
  };

  // États de chargement et d'erreur
  if (isLoading && !hasRequestedLoad) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Package className="w-12 h-12 text-opnskin-primary mx-auto mb-4" />
          <p className="text-opnskin-text-secondary">
            Cliquez sur "Charger l'inventaire" pour commencer
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-opnskin-text-primary mb-2">
            Erreur de chargement
          </h3>
          <p className="text-opnskin-text-secondary mb-4">
            {errorMsg || "Une erreur est survenue lors du chargement de l'inventaire"}
          </p>
          <Button onClick={handleRefreshInventory} className="btn-opnskin">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-opnskin-text-primary">
              {game.name}
            </h1>
            <p className="text-opnskin-text-secondary">
              {filteredItems.length} skin{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            Filtres
          </Button>
          <Button
            onClick={handleRefreshInventory}
            disabled={isLoading}
            className="btn-opnskin"
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
          <CardContent className="p-6">
            <InventoryFilters
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
              onRefresh={handleRefreshInventory}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Grille d'items */}
      <AnimatePresence>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-opnskin-text-secondary mx-auto mb-4" />
            <p className="text-opnskin-text-secondary">
              Aucun skin trouvé avec les filtres actuels
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <SkinCard
                  item={item}
                  onSell={() => handleSell(item)}
                  onDetails={() => handleDetails(item)}
                  floatValue={getFloatValue(item.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dialog de vente */}
      <SellDialog
        open={sellDialogOpen}
        onClose={closeSellDialog}
        selectedItem={selectedItem}
        sellPrice={sellPrice}
        onPriceChange={setSellPrice}
        onConfirm={handleSellConfirm}
        isSelling={isSelling}
      />

      {/* Dialog de détails (à implémenter) */}
      {/* <DetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        item={selectedItemForDetails}
      /> */}
    </div>
  );
} 