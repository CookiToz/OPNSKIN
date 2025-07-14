'use client';

import { useCartStore } from '@/hooks/use-cart-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/components/UserProvider';

export default function CartPage() {
  const { items, remove, clear, total, syncWithBackend } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const { toast } = useToast();
  const { user } = useUser();

  return (
    <div className="container py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Mon panier</h1>
      {items.length === 0 ? (
        <div className="text-center text-opnskin-text-secondary py-24">
          Votre panier est vide.
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {items.map((skin) => (
            <Card key={skin.id} className="flex items-center gap-4 p-4">
              <img src={skin.image} alt={skin.name} className="w-20 h-20 object-contain rounded" />
              <div className="flex-1">
                <div className="font-bold text-lg">{skin.name}</div>
                {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                <div className="font-mono text-opnskin-accent font-bold">
                  {cryptoRates[currency]
                    ? formatPrice(skin.price, currency, cryptoRates)
                    : currency === 'EUR'
                      ? `${skin.price.toFixed(2)} €`
                      : 'N/A'}
                </div>
              </div>
              <Button size="sm" variant="destructive" onClick={async () => {
                await fetch(`/api/cart/${skin.id}`, { method: 'DELETE' });
                await syncWithBackend();
              }}>
                Retirer
              </Button>
            </Card>
          ))}
          <div className="flex justify-between items-center mt-8 border-t pt-4">
            <div className="font-bold text-xl">Total :</div>
            <div className="font-mono text-2xl text-opnskin-accent">{formatPrice(total(), currency, cryptoRates)}</div>
          </div>
          <Button
            size="lg"
            className="btn-opnskin w-full mt-4"
            onClick={async () => {
              if (items.length === 0) return;
              // Vérification du tradeUrl
              if (!user?.tradeUrl || !user.tradeUrl.startsWith('https://steamcommunity.com/tradeoffer/new/')) {
                toast({
                  title: 'Lien Steam manquant',
                  description: 'Merci de renseigner votre tradelink Steam dans votre profil pour finaliser l\'achat.',
                  variant: 'destructive',
                });
                return;
              }
              try {
                const offerIds = items.map((skin) => skin.id);
                const res = await fetch('/api/transactions/bulk', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ offerIds }),
                });
                const data = await res.json();
                if (res.ok && data.results && data.results.every((r: any) => r.success)) {
                  toast({
                    title: 'Achat groupé réussi !',
                    description: 'Tous les skins ont été achetés avec succès.',
                  });
                  clear();
                  await syncWithBackend();
                } else {
                  toast({
                    title: 'Erreur lors de l\'achat',
                    description: data.error || 'Certains achats ont échoué.',
                    variant: 'destructive',
                  });
                  await syncWithBackend();
                }
              } catch (err) {
                toast({
                  title: 'Erreur réseau',
                  description: 'Impossible de finaliser l\'achat.',
                  variant: 'destructive',
                });
              }
            }}
            disabled={items.length === 0}
          >
            Passer au paiement
          </Button>
        </div>
      )}
    </div>
  );
} 