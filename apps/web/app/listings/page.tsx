"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/UserProvider";
import MyListingsTable from "@/components/listings/MyListingsTable";

export default function Listings() {
  const { t } = useTranslation("common");
  const { user, isLoading, isError } = useUser();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = () => {
    fetch('/api/offers?mine=true')
      .then(res => res.json())
      .then(data => {
        setOffers((data.offers || []).filter((offer: any) => offer.sellerId === user?.id));
        setLoading(false);
      })
      .catch(() => { setOffers([]); setLoading(false); });
  };

  useEffect(() => {
    if (user && user.loggedIn) {
      fetchOffers();
    } else {
      setOffers([]);
      setLoading(false);
    }
  }, [user]);

  if (isLoading || loading) return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-opnskin-primary" /></div>;
  if (isError) return <div>Erreur de connexion</div>;
  if (!user || !user.loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-2 md:px-0">
          <ListOrdered className="h-14 w-14 md:h-16 md:w-16 text-opnskin-text-secondary/30 mx-auto mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-satoshi-bold text-opnskin-text-primary">{t('inventory.not_logged_in_title', 'Connecte-toi via Steam pour voir tes offres')}</h2>
          <p className="text-opnskin-text-secondary mb-3 md:mb-4 text-base md:text-lg">{t('inventory.not_logged_in_desc', 'Tu dois être connecté via Steam pour accéder à tes offres.')}</p>
          <Button onClick={() => window.location.href = '/api/auth/steam'} className="btn-opnskin flex items-center gap-2 w-full max-w-xs mx-auto text-base md:text-lg">
            <img src="/icons8-steam-128.png" alt="Steam" className="w-6 h-6 object-contain" />
            {t('inventory.login_button', 'Se connecter via Steam')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <ListOrdered className="h-8 w-8 text-opnskin-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-text-primary">Mes annonces</h1>
        </div>
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <ListOrdered className="h-16 w-16 text-opnskin-text-secondary/30" />
            <div className="text-center">
              <h2 className="text-xl font-bold font-satoshi-bold text-opnskin-text-primary mb-2">Aucune annonce</h2>
              <p className="text-opnskin-text-secondary mb-4">Vous n'avez pas encore créé d'annonces.</p>
              <Button onClick={() => window.location.href = '/inventory'} className="btn-opnskin">Aller à l'inventaire</Button>
            </div>
          </div>
        ) : (
          <MyListingsTable offers={offers} currentUserId={user.id!} onChanged={fetchOffers} />
        )}
      </div>
    </div>
  );
}
