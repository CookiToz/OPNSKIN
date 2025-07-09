"use client";

import { useEffect, useState } from "react";
import { OfferCard } from "@/components/OfferCard";
import { useTranslation } from "react-i18next";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simule l'utilisateur connecté (à remplacer par l'auth plus tard)
const currentUserId = "user_simule_123";

export default function Listings() {
  const { t } = useTranslation("common");
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/offers/list?sellerId=${currentUserId}`);
      const data = await response.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Trie et groupe les offres par statut
  const groupByStatus = (status: string) =>
    offers
      .filter((o) => o.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sections = [
    { key: "AVAILABLE", label: "Actives" },
    { key: "PENDING_TRADE_OFFER", label: "En cours d'échange" },
    { key: "COMPLETED", label: "Terminées" },
    { key: "EXPIRED", label: "Expirées / Annulées" },
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
                          currentUserId={currentUserId}
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
