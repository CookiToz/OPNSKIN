"use client";
import React from "react";
import { useCartStore } from "@/hooks/use-cart-store";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { useCryptoRatesStore } from "@/hooks/use-currency-store";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, CheckCircle2 } from "lucide-react";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, remove, clear, total, syncWithBackend } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [loading, setLoading] = React.useState(false);

  // Synchroniser le panier quand il s'ouvre
  React.useEffect(() => {
    if (open) {
      syncWithBackend();
    }
  }, [open, syncWithBackend]);



  const handleBuy = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const offerIds = items.map((skin) => skin.id);
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerIds }),
      });
      const data = await res.json();
      if (res.ok && data.results && data.results.every((r: any) => r.success)) {
        toast({
          title: "Achat groupé réussi !",
          description: "Tous les skins ont été achetés avec succès.",
        });
        clear();
        await syncWithBackend();
        onClose();
      } else {
        if (data.error === 'Insufficient wallet balance') {
          toast({
            title: "Solde insuffisant",
            description: "Votre solde est insuffisant pour cet achat. Veuillez recharger votre compte.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur lors de l'achat",
            description: data.error || "Certains achats ont échoué.",
            variant: "destructive",
          });
        }
        await syncWithBackend();
      }
    } catch (err) {
      toast({
        title: "Erreur réseau",
        description: "Impossible de finaliser l'achat.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="bg-opnskin-bg-card rounded-t-2xl shadow-2xl border-t-4 border-opnskin-violet animate-slide-up">
        <DrawerHeader className="flex items-center justify-between px-6 pt-4 pb-2">
          <DrawerTitle className="flex items-center gap-2 text-2xl font-bold text-opnskin-accent">
            <ShoppingCart className="w-7 h-7" />
            Mon panier
          </DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Fermer le panier">
              ✕
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="px-6 pb-6 pt-2 min-h-[200px] max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-opnskin-text-secondary py-16">
              <ShoppingCart className="mx-auto mb-4 w-12 h-12 text-opnskin-violet/60" />
              <div className="font-bold text-lg">Votre panier est vide.</div>
              <div className="text-sm mt-2">Ajoutez des skins depuis la marketplace !</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((skin) => (
                <div key={skin.id} className="flex items-center gap-4 bg-opnskin-bg-card hover:bg-opnskin-bg-secondary/50 transition-colors rounded-xl p-3 shadow border border-opnskin-bg-secondary">
                  <img
                    src={skin.image || '/placeholder.svg'}
                    alt={skin.name}
                    className="w-20 h-20 object-contain rounded-lg border border-opnskin-bg-secondary bg-opnskin-bg-card/60"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-opnskin-text-primary truncate">{skin.name}</div>
                    <div className="font-mono text-opnskin-accent font-bold text-lg">
                      {typeof skin.price === 'number' && skin.price > 0
                        ? (currency in (cryptoRates as unknown as Record<string, number>)
                          ? (formatPrice as any)(skin.price, currency, cryptoRates)
                          : currency === "EUR"
                          ? `${skin.price.toFixed(2)} €`
                          : `${skin.price.toFixed(2)}`)
                        : "Prix non disponible"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/cart/${skin.id}`, {
                          method: 'DELETE',
                        });
                        if (res.ok) {
                          remove(skin.id);
                          await syncWithBackend();
                          toast({
                            title: "Article retiré",
                            description: "L'article a été retiré du panier.",
                          });
                        } else {
                          toast({
                            title: "Erreur",
                            description: "Impossible de retirer l'article du panier.",
                            variant: "destructive",
                          });
                        }
                      } catch (err) {
                        toast({
                          title: "Erreur réseau",
                          description: "Vérifiez votre connexion et réessayez.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 pt-2 flex justify-between items-center border-t border-opnskin-primary/10">
          <div className="flex flex-col">
            <div className="font-bold text-lg text-opnskin-text-primary">Total: {(formatPrice as any)(total(), currency, cryptoRates)}</div>
            <div className="text-sm text-opnskin-text-secondary">{items.length} article{items.length > 1 ? 's' : ''} dans le panier</div>
          </div>
          <Button onClick={handleBuy} disabled={loading} className="btn-opnskin">
            {loading ? "Achat en cours..." : "Acheter tous les skins"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}