"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import SkinCard from '@/components/SkinCard';
import { useUser } from "@/components/UserProvider";
import { useCartStore } from '@/hooks/use-cart-store';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import FilterSidebarOPNSKIN, { OPNSKINFilters, DEFAULT_OPNSKIN_FILTERS } from '@/components/FilterSidebarOPNSKIN';

const currentUserId = "user_simule_123";

const GAME_INFO = {
  cs2: { name: 'CS2', cover: '/CS2.png', color: '#FF6B35' },
  dota2: { name: 'Dota 2', cover: '/Dota2.png', color: '#FF6B6B' },
  rust: { name: 'Rust', cover: '/Rust.png', color: '#4ECDC4' },
  tf2: { name: 'Team Fortress 2', cover: '/TF2.png', color: '#45B7D1' },
};

export default function MarketplaceGamePage() {
  // Tous les hooks doivent être appelés au début, avant toute condition
  const { game } = useParams();
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { user, isLoading: userLoading } = useUser();

  // Ajout panier
  const [addingId, setAddingId] = useState<string | null>(null);
  const [cartOfferIds, setCartOfferIds] = useState<string[]>([]);
  const syncCart = useCartStore((state) => state.syncWithBackend);
  const cartItems = useCartStore((state) => state.items);

  // Hooks modaux (déplacés ici AVANT tout return/condition)
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  // Filtres avancés CS2
  const [filters, setFilters] = useState<OPNSKINFilters>(DEFAULT_OPNSKIN_FILTERS);
  // Extraire dynamiquement la liste des collections à partir des offres
  const collections = Array.from(new Set(offers.map((o) => o.collection).filter(Boolean)));
  
  // Fonction de filtrage côté frontend (à remplacer par filtrage API si besoin)
  const filteredOffers = offers.filter((offer) => {
    if (!offer) return false;
    
    // Recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const itemName = (offer.itemName || '').toLowerCase();
      const itemId = (offer.itemId || '').toLowerCase();
      if (!itemName.includes(searchLower) && !itemId.includes(searchLower)) {
        return false;
      }
    }
    
    // Prix
    if (offer.price < filters.price[0] || offer.price > filters.price[1]) return false;
    
    // Float (optionnel)
    if (filters.float && typeof offer.float === 'number' && (offer.float < filters.float[0] || offer.float > filters.float[1])) return false;
    
    // Wear (extraction robuste depuis le nom)
    let skinName = offer.itemName || offer.itemId || '';
    let wearMatch = skinName.match(/\((.*?)\)/);
    let wear = wearMatch ? wearMatch[1] : (offer.wear || offer.itemWear || '');
    if (filters.wear.length > 0 && !filters.wear.includes(wear)) return false;
    
    // Rareté
    if (filters.rarity.length > 0 && !filters.rarity.includes(offer.rarity || offer.itemRarity || '')) return false;
    
    // Type
    if (filters.type.length > 0 && !filters.type.includes(offer.type || offer.itemType || '')) return false;
    
    // StatTrak
    if (filters.stattrak !== null) {
      const isStatTrak = (skinName || '').toLowerCase().includes('stattrak');
      if (filters.stattrak !== isStatTrak) return false;
    }
    
    // Collection
    if (filters.collection && offer.collection !== filters.collection) return false;
    
    // Trade hold (simulé)
    if (filters.tradeHold !== null) {
      const isTradeHold = offer.tradeHold === true;
      if (filters.tradeHold !== isTradeHold) return false;
    }
    
    return true;
  });

  // Calcul du prix max dynamique
  const priceMax = offers.length > 0 ? Math.max(...offers.map(o => o.price || 0)) : 1000;

  // Fonction pour charger les offres
  const fetchOffers = async (showLoading = true) => {
    if (!game || !isClient) return;
    
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const res = await fetch(`/api/offers?game=${game}`);
      const data = await res.json();
      setOffers(Array.isArray(data.offers) ? data.offers : []);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres pour ce jeu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger le panier au montage
  useEffect(() => {
    const fetchCart = async () => {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (Array.isArray(data.cart)) {
        setCartOfferIds(data.cart.map((item: any) => item.offerId));
      }
    };
    fetchCart();
  }, []);

  // Hook pour détecter le client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hook pour charger les offres initiales (suppression de l'auto-refresh)
  useEffect(() => {
    if (!game || !isClient) return;
    fetchOffers(true);
  }, [game, isClient]);

  // Fonction de refresh manuel
  const handleRefresh = () => {
    fetchOffers(false);
  };

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
        // L'utilisateur peut rafraîchir manuellement s'il le souhaite
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

  const handleAddToCart = async (offerId: string) => {
    setAddingId(offerId);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Ajouté au panier !",
          description: "L'offre a été ajoutée à votre panier.",
        });
        setCartOfferIds(prev => [...prev, offerId]);
        await syncCart();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible d'ajouter au panier.",
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
      setAddingId(null);
    }
  };

  // Log pour debug
  console.log('OFFERS:', offers);

  // Conditions de rendu après tous les hooks
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

  // Définir la liste des cryptos supportées
  const SUPPORTED_CRYPTOS = ['ETH', 'GMC', 'BTC', 'SOL', 'XRP', 'LTC', 'TRX'];

  return (
    <div className="min-h-screen bg-opnskin-bg-primary">
      <div className="container mx-auto px-4 py-6">
        {/* Header avec navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
          
          {/* Bouton de refresh */}
          <Button 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            variant="outline"
            size="sm"
            className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>

        {/* Liste des offres avec filtres */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtres pour CS2 */}
          {game === 'cs2' && (
            <FilterSidebarOPNSKIN filters={filters} setFilters={setFilters} collections={collections} showFloat={true} priceMax={priceMax} />
          )}
          
          {/* Liste des offres */}
          <div className="flex-1 min-w-0">
            {loading || userLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-opnskin-primary" />
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-opnskin-text-secondary/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-opnskin-text-primary mb-2">
                  Aucune offre disponible
                </h3>
                <p className="text-opnskin-text-secondary mb-4">
                  Il n'y a actuellement aucune offre pour {gameInfo.name} avec ces filtres.
                </p>
                <Link href="/inventory">
                  <Button className="btn-opnskin">
                    Vendre mes items
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredOffers.map((offer) => {
                  const isMine = user && user.loggedIn && offer.sellerId === user.id;
                  
                  // Extraire les infos du skin depuis le nom (ex: "AK-47 | Fire Serpent (Factory New)")
                  const skinName = offer.itemName || offer.itemId || 'Skin inconnu';
                  const wearMatch = skinName.match(/\((.*?)\)/);
                  const wear = wearMatch ? wearMatch[1] : undefined;
                  
                  // Simuler StatTrak (à remplacer par les vraies données)
                  const isStatTrak = skinName.toLowerCase().includes('stattrak') || skinName.toLowerCase().includes('stat trak');
                  
                  // Calculer la vraie présence du vendeur
                  let isSellerOnline = false;
                  let lastSeen = undefined;
                  if (offer.seller && offer.seller.last_seen) {
                    // Forcer parsing UTC (ajoute 'Z' si pas déjà présent)
                    const lastSeenStr = offer.seller.last_seen.endsWith('Z') ? offer.seller.last_seen : offer.seller.last_seen + 'Z';
                    lastSeen = Date.parse(lastSeenStr);
                    isSellerOnline = Date.now() - lastSeen < 30 * 1000;
                  }
                  
                  // Simuler le float (à remplacer par les vraies données)
                  const float = offer.float ?? undefined;
                  
                  // DEBUG mapping présence
                  console.log('[PRESENCE DEBUG]', {
                    userId: user?.id,
                    offerSellerId: offer.sellerId,
                    offerSellerObjId: offer.seller?.id,
                    last_seen: offer.seller?.last_seen,
                    isSellerOnline
                  });
                  
                  return (
                    <SkinCard
                      key={offer.id || offer.itemId}
                      name={skinName}
                      image={offer.itemImage || '/placeholder.svg'}
                      price={offer.price || 0}
                      rarityLabel={offer.status || 'Disponible'}
                      currency={currency}
                      wear={wear}
                      float={float}
                      statTrak={isStatTrak}
                      isSellerOnline={isSellerOnline}
                      last_seen={offer.seller?.last_seen}
                      lastSeenDiff={lastSeen ? Date.now() - lastSeen : undefined}
                      actionButton={
                        isMine ? (
                          <div className="w-full mt-3 text-center text-xs text-opnskin-accent font-bold">Mon offre</div>
                        ) : cartOfferIds.includes(offer.id) ? (
                          <Button className="w-full btn-opnskin mt-3" disabled>
                            Déjà dans le panier
                          </Button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Button
                              className="w-full btn-opnskin mt-3"
                              onClick={() => handleAddToCart(offer.id)}
                              disabled={addingId === offer.id}
                            >
                              {addingId === offer.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Ajout...
                                </>
                              ) : (
                                "Ajouter au panier"
                              )}
                            </Button>
                            <Button
                              className="w-full btn-opnskin-secondary"
                              variant="outline"
                              onClick={() => { setSelectedOffer(offer); setShowDetails(true); }}
                            >
                              Détail
                            </Button>
                          </div>
                        )
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal détail skin */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogTitle>Détail du skin</DialogTitle>
          {selectedOffer && (
            <div className="flex flex-col items-center gap-4">
              <img src={selectedOffer.itemImage || '/placeholder.svg'} alt={selectedOffer.itemName || 'Skin'} className="w-32 h-32 object-contain rounded" />
              <div className="font-bold text-lg">{selectedOffer.itemName || selectedOffer.itemId || 'Nom inconnu'}</div>
              <div className="text-sm text-opnskin-text-secondary">ID: {selectedOffer.itemId || 'N/A'}</div>
              <div className="font-mono text-opnskin-accent font-bold">
                {typeof selectedOffer.price === 'number' && !isNaN(selectedOffer.price)
                  ? (SUPPORTED_CRYPTOS.includes(currency)
                      ? formatPrice(selectedOffer.price, currency, cryptoRates as unknown as Record<string, import('@/hooks/use-currency-store').CryptoRate>)
                      : `${selectedOffer.price.toFixed(2)} €`)
                  : 'N/A'}
              </div>
              <div className="text-xs text-opnskin-text-secondary">Statut: {selectedOffer.status || 'N/A'}</div>
              <DialogClose asChild>
                <Button className="mt-4">Fermer</Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 