'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  Shield,
  Wallet,
  LogOut,
  TrendingUp,
  HelpCircle,
  Gift,
  Package,
} from 'lucide-react';
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice, cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useUser } from "@/components/UserProvider";

interface SteamUser {
  name: string;
  avatar: string;
  steamId: string;
  profileUrl: string;
}

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  marketPrice: number;
}

export default function Profile() {
  const { t } = useTranslation('common');
  const { user, isLoading, isError } = useUser();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [tradeUrl, setTradeUrl] = useState<string>("");
  const [tradeUrlLoading, setTradeUrlLoading] = useState(false);
  const [tradeUrlMessage, setTradeUrlMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.tradeUrl) setTradeUrl(user.tradeUrl);
    if (user && user.email) setEmail(user.email);
  }, [user]);

  function isValidTradeUrl(url: string) {
    return url.startsWith('https://steamcommunity.com/tradeoffer/new/');
  }

  function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);
    if (!isValidEmail(email)) {
      setEmailMessage("Veuillez entrer une adresse email valide");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMessage("Adresse email mise à jour !");
      } else {
        setEmailMessage(data.error || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setEmailMessage("Erreur réseau ou serveur.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTradeUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeUrlMessage(null);
    if (!isValidTradeUrl(tradeUrl)) {
      setTradeUrlMessage("Le lien doit commencer par https://steamcommunity.com/tradeoffer/new/");
      return;
    }
    setTradeUrlLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setTradeUrlMessage("Lien d'échange Steam mis à jour !");
      } else {
        setTradeUrlMessage(data.error || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setTradeUrlMessage("Erreur réseau ou serveur.");
    } finally {
      setTradeUrlLoading(false);
    }
  };

  const fetchInventory = async () => {
    setLoadingInventory(true);
    setInventoryError(null);
    try {
      const res = await fetch(`/api/inventory?currency=${currency}`);
      if (!res.ok) throw new Error('Erreur lors du chargement de l\'inventaire');
      const data = await res.json();
      if (data.items) {
        setInventory(data.items);
      } else {
        setInventory([]);
        setInventoryError('Aucun item trouvé dans votre inventaire.');
      }
    } catch (err) {
      setInventory([]);
      setInventoryError('Erreur lors du chargement de l\'inventaire. Cliquez pour réessayer.');
    } finally {
      setLoadingInventory(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-center p-4 md:p-6">Chargement…</div>;
  }
  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-center p-4 md:p-6 text-red-500">Erreur de connexion</div>;
  }
  if (!user || !user.loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani mb-3 md:mb-4">{t('profile.login_title')}</h1>
          <p className="text-opnskin-text-secondary mb-4 md:mb-6 max-w-md mx-auto text-base md:text-lg">{t('profile.login_desc')}</p>
          <Button
            onClick={() => (window.location.href = '/api/auth/steam')}
            className="bg-opnskin-blue hover:bg-opnskin-blue/80 text-white px-4 md:px-6 py-3 rounded flex items-center gap-2 w-full max-w-xs mx-auto text-base md:text-lg"
          >
            <img
              src="/icons8-steam-128-noir.png"
              alt="Steam"
              className="w-6 h-6 object-contain"
            />
            {t('profile.login_button')}
          </Button>
        </div>
      </div>
    );
  }

  // Affichage du profil utilisateur Steam
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">Mon Profil</h1>
          <p className="text-opnskin-text-secondary text-base md:text-lg">{t('profile.subtitle')}</p>
        </div>

        <Tabs defaultValue="stats">
          <TabsList className="bg-opnskin-bg-card/60 border border-opnskin-bg-secondary mb-3 md:mb-4 flex flex-wrap md:flex-nowrap">
            <TabsTrigger value="stats">Profil</TabsTrigger>
            <TabsTrigger value="settings">{t('profile.tab_settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <Card className="bg-opnskin-bg-card/60 border-opnskin-bg-secondary mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6 flex flex-col items-center">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-opnskin-violet mb-3 md:mb-4">
                  {user ? (
                    <img src={user.avatar} alt="Avatar Steam" className="rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-opnskin-violet/20 text-opnskin-violet font-rajdhani text-2xl">
                      ?
                    </AvatarFallback>
                  )}
                </Avatar>

                <h2 className="text-lg md:text-2xl font-bold font-rajdhani mb-1">
                  {user?.name || t('profile.user')}
                </h2>
                <Badge className="bg-opnskin-violet/20 text-opnskin-violet border-opnskin-violet/30 mb-3 md:mb-4 text-xs md:text-base">
                  {t('profile.level_0')}
                </Badge>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
                  <div className="text-center">
                    <p className="text-opnskin-text-secondary text-xs md:text-sm">{t('profile.member_since')}</p>
                    <p className="font-mono text-sm md:text-base">{
                      user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                        : '—'
                    }</p>
                  </div>
                  <div className="text-center">
                    <p className="text-opnskin-text-secondary text-xs md:text-sm">{t('profile.steam_id')}</p>
                    <p className="font-mono text-xs truncate">{user?.steamId || '...'}</p>
                  </div>
                </div>

                <div className="w-full space-y-2 mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-opnskin-green" />
                    <span className="text-xs md:text-sm">{t('profile.verified_account')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-opnskin-blue" />
                    <span className="text-xs md:text-sm">{t('profile.wallet_connected')}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 text-base md:text-lg"
                  onClick={() => {
                    fetch('/api/logout').then(() => window.location.reload());
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('profile.logout')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-opnskin-bg-card/60 border-opnskin-bg-secondary mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold font-rajdhani mb-3 md:mb-4">Lien d'échange Steam</h3>
                <form onSubmit={handleTradeUrlSubmit} className="flex flex-col gap-3 max-w-lg">
                  <div className="flex items-center justify-between">
                    <label htmlFor="tradeUrl" className="text-sm text-opnskin-text-secondary">Votre Steam Trade URL</label>
                    <a
                      href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-opnskin-blue underline font-semibold hover:text-opnskin-violet transition-colors text-sm ml-2"
                    >
                      Steam URL
                    </a>
                  </div>
                  <input
                    id="tradeUrl"
                    type="text"
                    value={tradeUrl}
                    onChange={e => setTradeUrl(e.target.value)}
                    className="bg-opnskin-bg-secondary border border-opnskin-bg-secondary text-opnskin-text-primary rounded px-3 py-2 text-base"
                    placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                  />
                  <Button type="submit" className="w-fit" disabled={tradeUrlLoading}>
                    {tradeUrlLoading ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                  {tradeUrlMessage && (
                    <div className={`text-sm mt-1 ${tradeUrlMessage.includes('mis à jour') ? 'text-green-400' : 'text-red-400'}`}>{tradeUrlMessage}</div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="bg-opnskin-bg-card/60 border-opnskin-bg-secondary mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold font-rajdhani mb-3 md:mb-4">Adresse Email</h3>
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 max-w-lg">
                  <label htmlFor="email" className="text-sm text-opnskin-text-secondary">Votre adresse email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-opnskin-bg-secondary border border-opnskin-bg-secondary text-opnskin-text-primary rounded px-3 py-2 text-base"
                    placeholder="votre@email.com"
                  />
                  <Button type="submit" className="w-fit" disabled={emailLoading}>
                    {emailLoading ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                  {emailMessage && (
                    <div className={`text-sm mt-1 ${emailMessage.includes('mise à jour') ? 'text-green-400' : 'text-red-400'}`}>{emailMessage}</div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}