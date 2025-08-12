import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil } from "lucide-react";

type User = {
  id: string;
  name?: string;
  tradeUrl?: string | null;
};

type Transaction = {
  id: string;
  buyer: User;
};

type Offer = {
  id: string;
  itemId: string;
  price: number;
  status: "AVAILABLE" | "PENDING_TRADE_OFFER" | "COMPLETED" | "EXPIRED";
  sellerId: string;
  createdAt: string;
  transaction?: Transaction | null;
  itemImage?: string | null;
  itemName?: string | null;
};

type OfferCardProps = {
  offer: Offer;
  currentUserId: string;
  onOfferCancelled?: () => void;
};

export const OfferCard: React.FC<OfferCardProps> = ({ offer, currentUserId, onOfferCancelled }) => {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState<number>(offer.price);
  const [savingPrice, setSavingPrice] = useState(false);

  const canLaunchTrade =
    currentUserId === offer.sellerId &&
    offer.status === "PENDING_TRADE_OFFER" &&
    offer.transaction &&
    offer.transaction.buyer &&
    !!offer.transaction.buyer.tradeUrl;

  const canCancelOffer = 
    currentUserId === offer.sellerId && 
    offer.status === "AVAILABLE";

  const canEditPrice = canCancelOffer;

  const handleSavePrice = async () => {
    if (newPrice <= 0) {
      toast({ title: 'Prix invalide', description: 'Le prix doit être positif.', variant: 'destructive' });
      return;
    }
    setSavingPrice(true);
    try {
      const res = await fetch(`/api/offers/${offer.id}/price`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(newPrice) })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Échec de la mise à jour du prix');
      toast({ title: 'Prix mis à jour', description: `Nouveau prix: ${Number(newPrice).toFixed(2)} €` });
      setEditingPrice(false);
      (offer as any).price = Number(newPrice);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSavingPrice(false);
    }
  };

  const handleCancelOffer = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok || (response.status === 404 && (data.error === 'Offer not found' || data.error === 'Offre introuvable'))) {
        toast({
          title: "Offre retirée",
          description: data.message || "Votre offre a été retirée avec succès.",
        });
        setShowCancelDialog(false);
        onOfferCancelled?.();
      } else {
        toast({
          title: "Erreur",
          description: data.error || data.message || "Impossible de retirer l'offre.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du retrait de l'offre.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded-lg p-4 mb-4 shadow">
      <div className="flex flex-col gap-2">
        {/* Image du skin */}
        {offer.itemImage && (
          <div className="flex justify-center mb-2">
            <img
              src={offer.itemImage}
              alt={offer.itemName || 'Skin'}
              className="w-24 h-24 object-contain rounded shadow"
              loading="lazy"
            />
          </div>
        )}
        <div>
          <span className="font-bold">Item :</span> {offer.itemId}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Prix :</span>
          {editingPrice ? (
            <div className="flex items-center gap-2">
              <input type="number" className="bg-opnskin-bg-card border border-opnskin-bg-secondary rounded px-2 py-1 w-28 text-opnskin-text-primary"
                value={newPrice} min={0.01} step={0.01}
                onChange={(e) => setNewPrice(parseFloat(e.target.value))} />
              <Button size="sm" onClick={handleSavePrice} disabled={savingPrice} className="bg-opnskin-green hover:bg-opnskin-green/80">{savingPrice ? '...' : 'Enregistrer'}</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingPrice(false); setNewPrice(offer.price); }}>Annuler</Button>
            </div>
          ) : (
            <>
              <span>{offer.price} €</span>
              {canEditPrice && (
                <Button size="icon" variant="ghost" onClick={() => setEditingPrice(true)} title="Modifier le prix">
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
        <div>
          <span className="font-bold">Statut :</span> {offer.status}
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-2 mt-2">
          {/* Bouton d'échange Steam */}
          {canLaunchTrade ? (
            <a
              href={offer.transaction!.buyer.tradeUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-opnskin-blue hover:bg-opnskin-blue/80 text-white dark:text-white">
                Lancer l'échange Steam
              </Button>
            </a>
          ) : offer.status === "PENDING_TRADE_OFFER" && currentUserId === offer.sellerId ? (
            <div className="flex-1 text-yellow-400 text-sm bg-yellow-900/20 rounded px-3 py-2">
              ⚠️ L'acheteur n'a pas encore renseigné son lien Steam.
            </div>
          ) : null}

          {/* Bouton Retirer de la vente */}
          {canCancelOffer && (
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Retirer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-opnskin-bg-card border-opnskin-bg-secondary">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-opnskin-text-primary">
                    Retirer l'offre
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-opnskin-text-secondary">
                    Êtes-vous sûr de vouloir retirer cette offre ? Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelOffer}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700 text-white dark:text-white"
                  >
                    {isCancelling ? "Retrait..." : "Retirer l'offre"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        {/* Instructions dynamiques vendeur */}
        {offer.status === "PENDING_TRADE_OFFER" && currentUserId === offer.sellerId && offer.transaction && offer.transaction.buyer && offer.transaction.buyer.tradeUrl && (
          <div className="text-blue-400 text-xs mt-2">Envoyez le skin à l’acheteur via Steam. Cliquez sur « Lancer l’échange Steam ». L’argent sera libéré automatiquement dès que le skin sera détecté dans l’inventaire de l’acheteur.</div>
        )}
        {offer.status === "COMPLETED" && currentUserId === offer.sellerId && (
          <div className="text-green-400 text-xs mt-2">Transaction terminée. Le skin a été livré et l’argent a été libéré.</div>
        )}
      </div>
    </div>
  );
}; 