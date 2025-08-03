import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '../inventory/types';
import { validatePrice, isRareSkin } from '../inventory/utils';

export const useSelling = () => {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  const handleSell = (item: InventoryItem) => {
    setSelectedItem(item);
    setSellPrice('');
    setSellDialogOpen(true);
  };

  const handleSellConfirm = async () => {
    if (!selectedItem || !sellPrice.trim()) return;

    const price = parseFloat(sellPrice);
    const validation = validatePrice(price, selectedItem.marketPrice);
    
    if (!validation.isValid) {
      toast({
        title: "Erreur de prix",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    // Afficher des avertissements si nécessaire
    if (validation.warning) {
      const shouldContinue = window.confirm(
        `${validation.warning}\n\nVoulez-vous continuer ?`
      );
      if (!shouldContinue) return;
    }

    // Vérifier si c'est un skin rare
    if (isRareSkin(selectedItem)) {
      const isRareConfirmed = window.confirm(
        "Ce skin semble être rare. Êtes-vous sûr de vouloir le vendre ?"
      );
      if (!isRareConfirmed) return;
    }

    setIsSelling(true);
    
    try {
      const response = await fetch('/api/offers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          itemImage: selectedItem.icon,
          rarityCode: selectedItem.rarityCode,
          price: price,
          game: 'cs2'
        }),
      });

      if (response.ok) {
        toast({
          title: "Offre créée",
          description: "Votre skin a été mis en vente avec succès",
        });
        setSellDialogOpen(false);
        setSelectedItem(null);
        setSellPrice('');
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la création de l'offre",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      });
    } finally {
      setIsSelling(false);
    }
  };

  const closeSellDialog = () => {
    setSellDialogOpen(false);
    setSelectedItem(null);
    setSellPrice('');
  };

  return {
    selectedItem,
    sellDialogOpen,
    sellPrice,
    isSelling,
    setSellPrice,
    handleSell,
    handleSellConfirm,
    closeSellDialog,
  };
}; 