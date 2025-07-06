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
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) setSteamUser(data);
      });
  }, []);

  const totalValue = inventory.reduce((sum, item) => sum + (item.marketPrice || 0), 0);

  const fetchInventory = () => {
    setLoadingInventory(true);
    fetch(`/api/inventory?currency=${currency}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setInventory(data.items);
        setLoadingInventory(false);
      });
  };

  if (!steamUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-3xl font-bold font-rajdhani mb-4">{t('profile.login_title')}</h1>
          <p className="text-white/70 mb-6 max-w-md mx-auto">{t('profile.login_desc')}</p>
          <Button
            onClick={() => (window.location.href = '/api/auth/steam')}
            className="bg-kalpix-blue hover:bg-kalpix-blue/80 text-white px-6 py-3 rounded flex items-center gap-2"
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-rajdhani">{t('profile.title')}</h1>
          <p className="text-white/70">{t('profile.subtitle')}</p>
        </div>

        <Tabs defaultValue="stats">
          <TabsList className="bg-black/40 border border-white/10 mb-4">
            <TabsTrigger value="stats">{t('profile.tab_stats')}</TabsTrigger>
            <TabsTrigger value="inventory">{t('profile.tab_inventory')}</TabsTrigger>
            <TabsTrigger value="settings">{t('profile.tab_settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <Card className="bg-black/40 border-white/5 mb-6">
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 border-2 border-kalpix-violet mb-4">
                  {steamUser ? (
                    <img src={steamUser.avatar} alt="Avatar Steam" className="rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-kalpix-violet/20 text-kalpix-violet font-rajdhani text-2xl">
                      ?
                    </AvatarFallback>
                  )}
                </Avatar>

                <h2 className="text-2xl font-bold font-rajdhani mb-1">
                  {steamUser?.name || t('profile.user')}
                </h2>
                <Badge className="bg-kalpix-violet/20 text-kalpix-violet border-kalpix-violet/30 mb-4">
                  {t('profile.level_0')}
                </Badge>

                <div className="w-full grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-white/70 text-sm">{t('profile.member_since')}</p>
                    <p className="font-mono">21/04/2025</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 text-sm">{t('profile.steam_id')}</p>
                    <p className="font-mono text-xs truncate">{steamUser?.steamId || '...'}</p>
                  </div>
                </div>

                <div className="w-full space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-kalpix-green" />
                    <span className="text-sm">{t('profile.verified_account')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-kalpix-blue" />
                    <span className="text-sm">{t('profile.wallet_connected')}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
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
              <CardContent className="p-6">
                <h3 className="text-xl font-bold font-rajdhani mb-4">{t('profile.inventory_value')}</h3>
                <Button onClick={fetchInventory} disabled={loadingInventory} className="mb-4">
                  {loadingInventory ? t('profile.loading') : t('inventory.refresh', 'Mettre à jour mon inventaire')}
                </Button>
                {loadingInventory ? (
                  <p className="text-white">{t('profile.loading')}</p>
                ) : inventory.length === 0 ? (
                  <div className="text-center text-white/70">
                    {t('profile.no_item')}
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold font-mono text-kalpix-green mb-4">
                      {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                      {cryptoRates[currency] ? formatPrice(totalValue, currency, cryptoRates) : <span>...</span>}
                    </p>
                    <div className="space-y-4">
                      {inventory.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center border-b border-white/10 pb-2"
                        >
                          <div className="flex items-center gap-4">
                            <img src={item.icon} alt={item.name} className="w-12 h-12 rounded" />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-mono text-kalpix-green">
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
            <Card className="bg-black/40 border-white/5">
              <CardContent className="p-6 text-white/70">
                <p>Paramètres du compte (non fonctionnel pour la démo).</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}