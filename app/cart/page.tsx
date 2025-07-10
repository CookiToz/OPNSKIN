'use client';

import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import useCartStore, { useCryptoRatesStore } from '../../hooks/use-currency-store';
import { formatPrice } from '../../lib/utils';
import { cryptoIcons } from '../../lib/utils';

export default function CartPage() {
  const { items, remove, clear, total } = useCartStore();
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();

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
                {cryptoRates[currency] ? (
                  <div className="font-mono text-opnskin-accent font-bold">{formatPrice(skin.price, currency, cryptoRates)}</div>
                ) : (
                  <span>Loading...</span>
                )}
              </div>
              <Button size="sm" variant="destructive" onClick={() => remove(skin.id)}>
                Retirer
              </Button>
            </Card>
          ))}
          <div className="flex justify-between items-center mt-8 border-t pt-4">
            <div className="font-bold text-xl">Total :</div>
            <div className="font-mono text-2xl text-opnskin-accent">{formatPrice(total(), currency, cryptoRates)}</div>
          </div>
          <Button size="lg" className="btn-opnskin w-full mt-4" disabled>
            Passer au paiement
          </Button>
        </div>
      )}
    </div>
  );
} 