import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '../inventory/types';
import { validatePrice, isRareSkin } from '../inventory/utils';
import { formatPrice } from '@/lib/utils';

interface SellDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItem: InventoryItem | null;
  sellPrice: string;
  onPriceChange: (price: string) => void;
  onConfirm: () => void;
  isSelling: boolean;
}

export const SellDialog: React.FC<SellDialogProps> = ({
  open,
  onClose,
  selectedItem,
  sellPrice,
  onPriceChange,
  onConfirm,
  isSelling,
}) => {
  if (!selectedItem) return null;

  const price = parseFloat(sellPrice) || 0;
  const validation = validatePrice(price, selectedItem.marketPrice);
  const isRare = isRareSkin(selectedItem);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Vendre un skin</span>
            {isRare && (
              <Badge variant="destructive" className="text-xs">
                Rare
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informations sur l'item */}
          <div className="flex items-center gap-3 p-3 bg-opnskin-bg-secondary/40 rounded-lg">
            <img 
              src={selectedItem.icon} 
              alt={selectedItem.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-opnskin-text-primary">
                {selectedItem.name}
              </h3>
              {selectedItem.marketPrice && (
                <p className="text-sm text-opnskin-text-secondary">
                  Prix de marché : {formatPrice(selectedItem.marketPrice, 'EUR')}
                </p>
              )}
            </div>
          </div>

          {/* Formulaire de prix */}
          <div className="space-y-2">
            <Label htmlFor="sell-price">Prix de vente (€)</Label>
            <Input
              id="sell-price"
              type="number"
              step="0.01"
              min="0.01"
              value={sellPrice}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0.00"
              className={!validation.isValid && sellPrice ? 'border-red-500' : ''}
            />
            
            {!validation.isValid && sellPrice && (
              <p className="text-sm text-red-500">{validation.message}</p>
            )}
            
            {validation.warning && (
              <p className="text-sm text-yellow-600 bg-yellow-100 p-2 rounded">
                ⚠️ {validation.warning}
              </p>
            )}
          </div>

          {/* Recommandations de prix */}
          {selectedItem.marketPrice && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recommandations :</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Prix minimum : {formatPrice(selectedItem.marketPrice * 0.1, 'EUR')}</p>
                <p>• Prix recommandé : {formatPrice(selectedItem.marketPrice * 0.8, 'EUR')}</p>
                <p>• Prix maximum : {formatPrice(selectedItem.marketPrice * 5, 'EUR')}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={!validation.isValid || isSelling}
              className="flex-1"
            >
              {isSelling ? 'Vente en cours...' : 'Mettre en vente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 