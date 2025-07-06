import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'next-i18next';
import { useInventory } from "@/components/InventoryProvider";
import { useFloat } from "@/components/FloatProvider";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Tag, ExternalLink } from 'lucide-react';

export type GameType = {
  key: string;
  name: string;
  cover: string;
  appid: number;
};

type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  marketPrice?: number;
  rarityCode?: string;
};

type InventoryByGameProps = {
  game: GameType;
  onBack?: () => void;
};

// Mapping des codes de rareté vers les clés de traduction
const rarityKeyMap: Record<string, string> = {
  'Rarity_Common_Weapon': 'rarity_consumer',
  'Rarity_Uncommon_Weapon': 'rarity_industrial',
  'Rarity_Rare_Weapon': 'rarity_milspec',
  'Rarity_Mythical_Weapon': 'rarity_restricted',
  'Rarity_Legendary_Weapon': 'rarity_classified',
  'Rarity_Ancient_Weapon': 'rarity_covert',
  'Rarity_Immortal_Weapon': 'rarity_exceedingly_rare',
};

// Fonction pour extraire l'état de l'arme du nom
const getWeaponWear = (name: string): string => {
  if (name.includes('Factory New')) return 'wear_factory_new';
  if (name.includes('Minimal Wear')) return 'wear_minimal_wear';
  if (name.includes('Field-Tested')) return 'wear_field_tested';
  if (name.includes('Well-Worn')) return 'wear_well_worn';
  if (name.includes('Battle-Scarred')) return 'wear_battle_scarred';
  return '';
};

// Fonction pour extraire la catégorie d'arme du nom
const getWeaponCategory = (name: string): string => {
  const weaponTypes = {
    'AK': 'AK-47',
    'M4A1': 'M4A1',
    'M4A4': 'M4A4',
    'AWP': 'AWP',
    'Glock': 'Glock',
    'USP': 'USP',
    'P250': 'P250',
    'Deagle': 'Desert Eagle',
    'MP7': 'MP7',
    'P90': 'P90',
    'Nova': 'Nova',
    'XM1014': 'XM1014',
    'MAG': 'MAG-7',
    'Negev': 'Negev',
  };
  
  for (const [key, value] of Object.entries(weaponTypes)) {
    if (name.includes(key)) return value;
  }
  return 'weapon';
};

export default function InventoryByGame({ game, onBack }: InventoryByGameProps) {
  const { t } = useTranslation('common');
  const [hasRequestedLoad, setHasRequestedLoad] = useState(false);
  const { items, isLoading, isError, errorMsg, refetch } = useInventory(hasRequestedLoad ? (game?.appid ? String(game.appid) : undefined) : undefined);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleBack = () => {
    localStorage.removeItem('opnskin-inventory-game');
    if (onBack) onBack();
  };

  const handleRefreshInventory = () => {
    setHasRequestedLoad(true);
    refetch();
  };

  const handleSell = (item: InventoryItem) => {
    setSelectedItem(item);
    setSellPrice(item.marketPrice ? item.marketPrice.toString() : '');
    setSellDialogOpen(true);
  };

  const handleSellConfirm = () => {
    // TODO: Implémenter la logique de vente
    console.log('Vendre', selectedItem?.name, 'pour', sellPrice, '€');
    setSellDialogOpen(false);
    setSelectedItem(null);
    setSellPrice('');
  };

  const handleDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  // Filtrer les skins de faible valeur (< 0.02€)
  const filteredItems = items.filter(item => 
    item.marketPrice === undefined || item.marketPrice >= 0.02
  );

  return (
    <div className="flex flex-col items-center py-8 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <button onClick={handleBack} className="text-white font-bold text-3xl mr-2 hover:text-[#00ffe7] transition-colors duration-200" aria-label={t('inventory.back', 'Retour à la sélection du jeu')}>←</button>
        )}
        <h2 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-tight text-opnskin-primary drop-shadow-lg">
          {t('inventory.title', 'Inventaire')} {t(`marketplace.game_${game.key}`, game.name)}
        </h2>
        <Button 
          onClick={handleRefreshInventory}
          disabled={isLoading}
          className="btn-opnskin-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('inventory.refresh', 'Actualiser')}
        </Button>
      </div>

      {!hasRequestedLoad ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-text-secondary text-lg font-rajdhani text-center">
            {t('inventory.click_to_load', 'Cliquez sur "Actualiser" pour charger l\'inventaire {{gameName}}', { gameName: t(`marketplace.game_${game.key}`, game.name) })}
          </div>
          <Button 
            onClick={handleRefreshInventory}
            className="btn-opnskin flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('inventory.load_inventory', 'Charger l\'inventaire')}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-primary text-xl font-rajdhani animate-pulse">
            {t('inventory.loading', "Chargement de l'inventaire…")}
          </div>
          {onBack && (
            <button 
              onClick={onBack} 
              className="btn-opnskin-secondary flex items-center gap-2"
            >
              ← {t('inventory.back_to_games', 'Retour aux jeux')}
            </button>
          )}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-red-500 text-lg font-bold text-center">
            {errorMsg || t('inventory.error_loading', "Erreur lors du chargement de l'inventaire")}
          </div>
          <div className="text-opnskin-text-secondary text-sm text-center max-w-md">
            {errorMsg?.includes('privé') && (
              <p>Votre inventaire Steam est privé. Allez dans les paramètres de votre profil Steam et rendez votre inventaire public.</p>
            )}
            {errorMsg?.includes('404') && (
              <p>Vous n'avez pas d'inventaire pour ce jeu ou votre profil Steam n'est pas accessible.</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleRefreshInventory} className="btn-opnskin">
              {t('inventory.retry')}
            </Button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="btn-opnskin-secondary flex items-center gap-2"
              >
                ← {t('inventory.back_to_games', 'Retour aux jeux')}
              </button>
            )}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="text-opnskin-text-secondary text-lg font-rajdhani text-center">
            {t('inventory.empty_game', 'L\'inventaire {{gameName}} est vide', { gameName: t(`marketplace.game_${game.key}`, game.name) })}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleRefreshInventory} className="btn-opnskin-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('inventory.refresh', 'Actualiser')}
            </Button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="btn-opnskin-secondary flex items-center gap-2"
              >
                ← {t('inventory.back_to_games', 'Retour aux jeux')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full max-w-7xl">
          {filteredItems.map(item => {
            const rarity = item.rarityCode ? rarityKeyMap[item.rarityCode] : null;
            const weaponCategory = getWeaponCategory(item.name);
            const weaponWear = getWeaponWear(item.name);
            
            return (
              <Card key={item.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover overflow-hidden group">
                <div className="aspect-square relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-opnskin-bg-card/80 z-10"></div>
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  {rarity && (
                    <Badge className="absolute top-2 right-2 z-20 bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 text-xs">
                      {t(`inventory.${rarity}`)}
                    </Badge>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-opnskin-text-secondary">{t(`inventory.${weaponCategory}`)}</span>
                      {item.marketPrice !== undefined && (
                        <span className="font-mono text-opnskin-accent font-bold text-sm">{item.marketPrice} €</span>
                      )}
                    </div>
                    <h3 className="font-satoshi-bold text-sm truncate text-opnskin-text-primary">{item.name}</h3>
                    {weaponWear && (
                      <p className="text-xs text-opnskin-text-secondary italic">
                        {t(`inventory.${weaponWear}`)}
                      </p>
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center gap-2">
                    <Button 
                      size="sm" 
                      className="btn-opnskin-secondary flex-1 text-xs" 
                      onClick={() => handleSell(item)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {t('inventory.sell', 'Vendre')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 text-xs"
                      onClick={() => handleDetails(item)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de vente */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
          <DialogHeader>
            <DialogTitle className="text-opnskin-text-primary">
              {t('inventory.sell_skin', 'Vendre {{skinName}}', { skinName: selectedItem?.name })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={selectedItem?.icon} alt={selectedItem?.name} className="w-16 h-16 object-contain" />
              <div>
                <h3 className="font-satoshi-bold text-opnskin-text-primary">{selectedItem?.name}</h3>
                <p className="text-opnskin-text-secondary text-sm">
                  {t('inventory.market_price', 'Prix du marché: {{price}} €', { price: selectedItem?.marketPrice || 'N/A' })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-price" className="text-opnskin-text-primary">
                {t('inventory.sell_price', 'Prix de vente (€)')}
              </Label>
              <Input
                id="sell-price"
                type="number"
                step="0.01"
                min="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder={t('inventory.enter_price', 'Entrez votre prix')}
                className="bg-opnskin-bg-secondary border-opnskin-bg-secondary text-opnskin-text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSellConfirm} className="btn-opnskin flex-1">
                {t('inventory.confirm_sale', 'Confirmer la vente')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSellDialogOpen(false)}
                className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
              >
                {t('inventory.cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-opnskin-bg-card border-opnskin-bg-secondary max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-opnskin-text-primary">
              {t('inventory.skin_details', 'Détails du skin')}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <img src={selectedItem.icon} alt={selectedItem.name} className="w-32 h-32 object-contain" />
                <div className="flex-1">
                  <h3 className="font-satoshi-bold text-xl text-opnskin-text-primary mb-2">{selectedItem.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-opnskin-text-secondary">
                        {t('inventory.category', 'Catégorie:')}
                      </span>
                      <span className="text-opnskin-text-primary">{t(`inventory.${getWeaponCategory(selectedItem.name)}`)}</span>
                    </div>
                    {getWeaponWear(selectedItem.name) && (
                      <div className="flex justify-between">
                        <span className="text-opnskin-text-secondary">
                          {t('inventory.wear', 'État:')}
                        </span>
                        <span className="text-opnskin-text-primary italic">
                          {t(`inventory.${getWeaponWear(selectedItem.name)}`)}
                        </span>
                      </div>
                    )}
                    {selectedItem.marketPrice !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-opnskin-text-secondary">
                          {t('inventory.market_price', 'Prix du marché: {{price}} €', { price: selectedItem.marketPrice })}
                        </span>
                        <span className="text-opnskin-accent font-mono font-bold">{selectedItem.marketPrice} €</span>
                      </div>
                    )}
                    {selectedItem.rarityCode && rarityKeyMap[selectedItem.rarityCode] && (
                      <div className="flex justify-between">
                        <span className="text-opnskin-text-secondary">
                          {t('inventory.rarity', 'Rareté:')}
                        </span>
                        <Badge className="bg-opnskin-accent/10 text-opnskin-accent border-opnskin-accent/30 text-xs">
                          {t(`inventory.${rarityKeyMap[selectedItem.rarityCode]}`)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Section Float */}
              <div className="border-t border-opnskin-bg-secondary pt-4">
                <h4 className="font-satoshi-bold text-lg text-opnskin-text-primary mb-3">
                  {t('inventory.float_info', 'Informations Float')}
                </h4>
                <SkinFloatDetails itemId={selectedItem.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant pour afficher les détails du float
function SkinFloatDetails({ itemId }: { itemId: string }) {
  const { t } = useTranslation('common');
  const floatState = useFloat(itemId);
  const [showFloat, setShowFloat] = useState(false);

  return (
    <div className="space-y-3">
      {!showFloat ? (
        <Button 
          onClick={() => setShowFloat(true)} 
          className="btn-opnskin-secondary"
        >
          {t('inventory.load_float_info', 'Charger les informations Float')}
        </Button>
      ) : (
        <div className="space-y-2">
          {floatState.isLoading ? (
            <div className="text-opnskin-primary animate-pulse">
              {t('inventory.loading_float', 'Chargement des informations Float…')}
            </div>
          ) : floatState.isError ? (
            <div className="text-red-500">
              {t('inventory.float_error', 'Erreur: {{error}}', { error: floatState.errorMsg || 'Impossible de récupérer les informations Float' })}
            </div>
          ) : floatState.data?.float !== null ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-opnskin-text-secondary">
                  {t('inventory.float_value', 'Float:')}
                </span>
                <span className="text-opnskin-accent font-mono font-bold">{floatState.data?.float}</span>
              </div>
              {floatState.data?.csfloatLink && (
                <div className="flex justify-between">
                  <span className="text-opnskin-text-secondary">
                    {t('inventory.csfloat_link', 'Lien CSFloat:')}
                  </span>
                  <a 
                    href={floatState.data.csfloatLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-opnskin-primary hover:text-opnskin-primary-hover underline"
                  >
                    {t('inventory.view_on_csfloat', 'Voir sur CSFloat')}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-opnskin-text-secondary">
              {t('inventory.no_float_info', 'Aucune information Float disponible')}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 