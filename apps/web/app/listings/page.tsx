"use client";

import { useEffect, useState } from "react";
import { OfferCard } from "@/components/OfferCard";
import { useTranslation } from "react-i18next";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/UserProvider";

export default function Listings() {
  const { t } = useTranslation("common");
  const { user, isLoading, isError } = useUser();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.loggedIn) {
      // Si user.offers est exposé par l'API, utilise-le directement
      if (user.offers) {
        setOffers(user.offers.filter((offer: any) => offer.sellerId === user.id));
        setLoading(false);
      } else {
        // Sinon, fetch une route dédiée si besoin
        fetch('/api/offers?mine=true')
          .then(res => res.json())
          .then(data => {
            setOffers((data.offers || []).filter((offer: any) => offer.sellerId === user.id));
            setLoading(false);
          })
          .catch(() => {
            setOffers([]);
            setLoading(false);
          });
      }
    } else {
      setOffers([]);
      setLoading(false);
    }
  }, [user]);

  if (isLoading || loading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur de connexion</div>;
  if (!user || !user.loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-2 md:px-0">
          <Package className="h-14 w-14 md:h-16 md:w-16 text-opnskin-text-secondary/30 mx-auto mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.not_logged_in_title', 'Connecte-toi via Steam pour voir tes offres')}</h2>
          <p className="text-opnskin-text-secondary mb-3 md:mb-4 text-base md:text-lg">{t('inventory.not_logged_in_desc', 'Tu dois être connecté via Steam pour accéder à tes offres.')}</p>
          <Button onClick={() => window.location.href = '/api/auth/steam'} className="btn-opnskin flex items-center gap-2 w-full max-w-xs mx-auto text-base md:text-lg">
            <img
              src="/icons8-steam-128.png"
              alt="Steam"
              className="w-6 h-6 object-contain"
            />
            {t('inventory.login_button', 'Se connecter via Steam')}
          </Button>
        </div>
      </div>
    );
  }

  // Trie et groupe les offres par statut
  const groupByStatus = (status: string) =>
    offers
      .filter((o) => o.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(o => ({
        ...o,
        id: o.id || o.offerId // force l'UUID comme id si jamais il y a un mapping incorrect
      }));

  const sections = [
    { key: "AVAILABLE", label: "Actives" },
    // Les autres sections sont supprimées
  ];

  const handleOfferCancelled = () => {
    // Rafraîchir la liste après retrait d'une offre
    fetchOffers();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Package className="h-8 w-8 text-opnskin-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-text-primary">
            Mes annonces
          </h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-opnskin-primary" />
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <Package className="h-16 w-16 text-opnskin-text-secondary/30" />
            <div className="text-center">
              <h2 className="text-xl font-bold font-satoshi-bold text-opnskin-text-primary mb-2">
                Aucune annonce
              </h2>
              <p className="text-opnskin-text-secondary mb-4">
                Vous n'avez pas encore créé d'annonces.
              </p>
              <Button 
                onClick={() => window.location.href = '/inventory'} 
                className="btn-opnskin"
              >
                Aller à l'inventaire
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => {
              const sectionOffers = groupByStatus(section.key);
              return (
                <div key={section.key}>
                  <h2 className="text-xl md:text-2xl font-bold font-rajdhani mb-4 text-opnskin-text-primary">
                    {section.label}
                  </h2>
                  {sectionOffers.length === 0 ? (
                    <div className="text-opnskin-text-secondary italic mb-4">
                      Aucune annonce {section.key === "AVAILABLE" ? "active" : 
                                    section.key === "PENDING_TRADE_OFFER" ? "en cours d'échange" :
                                    section.key === "COMPLETED" ? "terminée" : "expirée"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sectionOffers.map((offer) => (
                        <OfferCard 
                          key={offer.id} 
                          offer={offer} 
                          currentUserId={user?.id}
                          onOfferCancelled={handleOfferCancelled}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
