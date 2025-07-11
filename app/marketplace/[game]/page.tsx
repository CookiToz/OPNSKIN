"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import SkinCard from '@/components/SkinCard';

const currentUserId = "user_simule_123";

const GAME_INFO = {
  cs2: { name: 'CS2', cover: '/CS2.png', color: '#FF6B35' },
  dota2: { name: 'Dota 2', cover: '/Dota2.png', color: '#FF6B6B' },
  rust: { name: 'Rust', cover: '/Rust.png', color: '#4ECDC4' },
  tf2: { name: 'Team Fortress 2', cover: '/TF2.png', color: '#45B7D1' },
};

export default function MarketplaceGamePage() {
  const { game } = useParams();
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!game || typeof game !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-opnskin-text-primary mb-4">Erreur : jeu non spécifié</h1>
          <Link href="/marketplace">
            <Button className="btn-opnskin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const gameInfo = GAME_INFO[game.toLowerCase() as keyof typeof GAME_INFO];
  if (!gameInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-opnskin-text-primary mb-4">Jeu non trouvé</h1>
          <Link href="/marketplace">
            <Button className="btn-opnskin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!game) return;
    setLoading(true);
    fetch(`/api/offers?game=${game}`)
      .then((res) => res.json())
      .then((data) => {
        setOffers(Array.isArray(data.offers) ? data.offers : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des offres:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les offres pour ce jeu.",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, [game, toast]);

  const handleBuy = async (offerId: string, offerPrice: number) => {
    setBuyingId(offerId);
    try {
      const res = await fetch(`/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          offerId: offerId
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Achat réussi !",
          description: "L'offre est maintenant en cours d'échange. Vérifiez vos transactions.",
        });
        // Rafraîchir la liste des offres
        setOffers(prev => prev.filter(offer => offer.id !== offerId));
      } else {
        toast({
          title: "Erreur lors de l'achat",
          description: data.error || "Impossible de finaliser l'achat.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur réseau",
        description: "Vérifiez votre connexion et réessayez.",
        variant: "destructive",
      });
    } finally {
      setBuyingId(null);
    }
  };

  // Log pour debug
  console.log('OFFERS:', offers);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        {/* Header avec navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/marketplace">
            <Button variant="outline" size="sm" className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img src={gameInfo.cover} alt={gameInfo.name} className="w-8 h-8 rounded" />
            <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-text-primary">
              Marketplace - {gameInfo.name}
            </h1>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-opnskin-accent" />
                <span className="text-opnskin-text-secondary">Offres disponibles</span>
              </div>
              <p className="text-2xl font-bold text-opnskin-text-primary mt-1">
                {loading ? "..." : offers.length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-opnskin-text-secondary">Prix moyen</span>
              </div>
              <p className="text-2xl font-bold text-opnskin-accent mt-1">
                {loading ? "..." : offers.length > 0 
                  ? formatPrice(
                      offers.reduce((sum, offer) => sum + offer.price, 0) / offers.length,
                      currency,
                      cryptoRates
                    )
                  : "N/A"
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-opnskin-text-secondary">Valeur totale</span>
              </div>
              <p className="text-2xl font-bold text-opnskin-accent mt-1">
                {loading ? "..." : offers.length > 0 
                  ? formatPrice(
                      offers.reduce((sum, offer) => sum + offer.price, 0),
                      currency,
                      cryptoRates
                    )
                  : "N/A"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres (placeholder) */}
        <div className="mb-6">
          <div className="bg-opnskin-bg-card/50 border border-opnskin-bg-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 text-opnskin-text-secondary">
              <span className="text-sm">🔧 Filtres avancés à venir</span>
              <Badge variant="outline" className="text-xs">Bientôt</Badge>
            </div>
            <p className="text-xs text-opnskin-text-secondary mt-1">
              Rareté, prix, état, StatTrak, etc.
            </p>
          </div>
        </div>

        {/* Liste des offres */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-opnskin-primary" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-opnskin-text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-opnskin-text-primary mb-2">
              Aucune offre disponible
            </h3>
            <p className="text-opnskin-text-secondary mb-4">
              Il n'y a actuellement aucune offre pour {gameInfo.name}.
            </p>
            <Link href="/inventory">
              <Button className="btn-opnskin">
                Vendre mes items
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {offers.map((offer) => (
              <SkinCard
                key={offer.id || offer.itemId}
                name={offer.itemName || offer.itemId || 'Skin inconnu'}
                image={offer.itemImage || '/placeholder.svg'}
                price={offer.price || 0}
                rarityLabel={offer.status || 'Disponible'}
                currency={currency}
                actionButton={
                  <Button
                    className="w-full btn-opnskin mt-3"
                    onClick={() => handleBuy(offer.id || offer.itemId, offer.price || 0)}
                    disabled={buyingId === (offer.id || offer.itemId)}
                  >
                    {buyingId === (offer.id || offer.itemId) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Achat en cours...
                      </>
                    ) : (
                      "Acheter"
                    )}
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 