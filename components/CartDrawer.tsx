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
          icon: <CheckCircle2 className="text-green-500" />,
        });
        clear();
        await syncWithBackend();
        onClose();
      } else {
        toast({
          title: "Erreur lors de l'achat",
          description: data.error || "Certains achats ont échoué.",
          variant: "destructive",
        });
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
      <DrawerContent className="bg-opnskin-bg-card rounded-t-2xl shadow-2xl border-t-4 border-kalpix-violet animate-slide-up">
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
              <ShoppingCart className="mx-auto mb-4 w-12 h-12 text-kalpix-violet/60" />
              <div className="font-bold text-lg">Votre panier est vide.</div>
              <div className="text-sm mt-2">Ajoutez des skins depuis la marketplace !</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((skin) => (
                <div key={skin.id} className="flex items-center gap-4 bg-opnskin-bg-secondary rounded-lg p-3 shadow-sm">
                  <img src={skin.image} alt={skin.name} className="w-16 h-16 object-contain rounded" />
                  <div className="flex-1">
                    <div className="font-bold text-base text-opnskin-text-primary">{skin.name}</div>
                    <div className="font-mono text-opnskin-accent font-bold">
                      {cryptoRates[currency]
                        ? formatPrice(skin.price, currency, cryptoRates)
                        : currency === "EUR"
                        ? `${skin.price.toFixed(2)} €`
                        : "N/A"}
                    </div>
                  </div>
                  <Button size="icon" variant="destructive" onClick={async () => { await fetch(`/api/cart/${skin.id}`, { method: 'DELETE' }); remove(skin.id); }}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 pt-2 border-t border-opnskin-bg-secondary">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-xl">Total :</div>
            <div className="font-mono text-2xl text-opnskin-accent">{formatPrice(total(), currency, cryptoRates)}</div>
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              className="btn-opnskin flex-1"
              onClick={handleBuy}
              disabled={items.length === 0 || loading}
            >
              Acheter
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-kalpix-violet text-kalpix-violet"
              onClick={clear}
              disabled={items.length === 0 || loading}
            >
              Vider
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 