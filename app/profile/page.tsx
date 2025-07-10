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

  useEffect(() => {
    if (user && user.tradeUrl) setTradeUrl(user.tradeUrl);
  }, [user]);

  function isValidTradeUrl(url: string) {
    return url.startsWith('https://steamcommunity.com/tradeoffer/new/');
  }

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

  const fetchInventory = () => {
    setLoadingInventory(true);
    fetch(`/api/inventory?currency=${currency}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setInventory(data.items);
        setLoadingInventory(false);
      });
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
          <p className="text-white/70 mb-4 md:mb-6 max-w-md mx-auto text-base md:text-lg">{t('profile.login_desc')}</p>
          <Button
            onClick={() => (window.location.href = '/api/auth/steam')}
            className="bg-kalpix-blue hover:bg-kalpix-blue/80 text-white px-4 md:px-6 py-3 rounded flex items-center gap-2 w-full max-w-xs mx-auto text-base md:text-lg"
          >
            <img
              src="/icons8-steam-128.png"
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
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">{t('profile.title')}</h1>
          <p className="text-white/70 text-base md:text-lg">{t('profile.subtitle')}</p>
        </div>

        <Tabs defaultValue="stats">
          <TabsList className="bg-black/40 border border-white/10 mb-3 md:mb-4 flex flex-wrap md:flex-nowrap">
            <TabsTrigger value="stats">{t('profile.tab_stats')}</TabsTrigger>
            <TabsTrigger value="inventory">{t('profile.tab_inventory')}</TabsTrigger>
            <TabsTrigger value="settings">{t('profile.tab_settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <Card className="bg-black/40 border-white/5 mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6 flex flex-col items-center">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-kalpix-violet mb-3 md:mb-4">
                  {user ? (
                    <img src={user.avatar} alt="Avatar Steam" className="rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-kalpix-violet/20 text-kalpix-violet font-rajdhani text-2xl">
                      ?
                    </AvatarFallback>
                  )}
                </Avatar>

                <h2 className="text-lg md:text-2xl font-bold font-rajdhani mb-1">
                  {user?.name || t('profile.user')}
                </h2>
                <Badge className="bg-kalpix-violet/20 text-kalpix-violet border-kalpix-violet/30 mb-3 md:mb-4 text-xs md:text-base">
                  {t('profile.level_0')}
                </Badge>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
                  <div className="text-center">
                    <p className="text-white/70 text-xs md:text-sm">{t('profile.member_since')}</p>
                    <p className="font-mono text-sm md:text-base">21/04/2025</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 text-xs md:text-sm">{t('profile.steam_id')}</p>
                    <p className="font-mono text-xs truncate">{user?.steamId || '...'}</p>
                  </div>
                </div>

                <div className="w-full space-y-2 mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-kalpix-green" />
                    <span className="text-xs md:text-sm">{t('profile.verified_account')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-kalpix-blue" />
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

          <TabsContent value="inventory">
            <Card className="bg-black/40 border-white/5">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold font-rajdhani mb-3 md:mb-4">{t('profile.inventory_value')}</h3>
                <Button onClick={fetchInventory} disabled={loadingInventory} className="mb-3 md:mb-4 w-full max-w-xs mx-auto text-base md:text-lg">
                  {loadingInventory ? t('profile.loading') : t('inventory.refresh', 'Mettre à jour mon inventaire')}
                </Button>
                {loadingInventory ? (
                  <p className="text-white text-base md:text-lg">{t('profile.loading')}</p>
                ) : inventory.length === 0 ? (
                  <div className="text-center text-white/70 text-base md:text-lg">
                    {t('profile.no_item')}
                  </div>
                ) : (
                  <>
                    <p className="text-2xl md:text-3xl font-bold font-mono text-kalpix-green mb-3 md:mb-4">
                      {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                      {cryptoRates[currency] ? formatPrice(totalValue, currency, cryptoRates) : <span>...</span>}
                    </p>
                    <div className="space-y-3 md:space-y-4">
                      {inventory.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-2 gap-2 md:gap-4"
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <img src={item.icon} alt={item.name} className="w-10 h-10 md:w-12 md:h-12 rounded" />
                            <span className="text-sm md:text-base">{item.name}</span>
                          </div>
                          <span className="font-mono text-kalpix-green text-sm md:text-base">
                            {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                            {cryptoRates[currency] ? formatPrice(item.marketPrice, currency, cryptoRates) : <span>...</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-black/40 border-white/5 mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold font-rajdhani mb-3 md:mb-4">Lien d'échange Steam</h3>
                <form onSubmit={handleTradeUrlSubmit} className="flex flex-col gap-3 max-w-lg">
                  <label htmlFor="tradeUrl" className="text-sm text-white/70">Votre Steam Trade URL</label>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}