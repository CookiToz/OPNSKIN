'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Search, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCryptoRates } from '@/hooks/use-crypto-rates';
import { cryptoIcons } from '@/lib/utils';
import { useSearchStore } from '@/hooks/use-search-store';
import { useTranslation } from 'next-i18next';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { useUser } from "@/components/UserProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from 'next/navigation';

export function Header() {
  const { t } = useTranslation('common');
  const [notifications] = useState([
    {
      id: 1,
      title: 'Nouvelle offre reçue',
      message: 'Vous avez reçu une offre pour votre skin AK-47',
      time: 'Il y a 5 minutes',
      unread: true,
    },
    {
      id: 2,
      title: 'Vente réussie',
      message: 'Votre item a été vendu avec succès',
      time: 'Il y a 1 heure',
      unread: false,
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [cartCount] = useState(2);
  const { user, isLoading: userLoading, isError: userError, refetch } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();
  const rawCryptoRates = useCryptoRates();
  const cryptoRates = typeof rawCryptoRates === 'object' && rawCryptoRates !== null ? rawCryptoRates : { ETH: 0, GMC: 0, BTC: 0, SOL: 0, XRP: 0, LTC: 0, TRX: 0 };
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const pathname = usePathname();

  const handleLogout = () => {
    fetch('/api/logout').then(() => {
      refetch();
      window.location.reload();
    });
  };

  const solde = 0;
  const isSteamLinked = user && user.loggedIn;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full bg-opnskin-bg-primary/80 shadow-[0_2px_8px_rgba(40,124,250,0.04)]">
        <div className="flex items-center justify-between px-4" style={{ height: 80, minHeight: 80, maxHeight: 80 }}>
          <div className="flex-1 flex items-center space-x-4">
            {(pathname.startsWith('/inventory') || pathname.startsWith('/marketplace')) && (
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-opnskin-text-secondary" />
                <Input
                  type="search"
                  placeholder={t('header.search_placeholder')}
                  className="w-full pl-10 bg-opnskin-bg-secondary/50 border-opnskin-bg-secondary text-opnskin-text-secondary focus:border-opnskin-primary focus:bg-opnskin-bg-secondary"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24 ml-4 bg-opnskin-bg-secondary border-opnskin-primary/30 text-opnskin-accent font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-opnskin-bg-card border-opnskin-primary/30 max-h-60 overflow-y-auto">
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
                <SelectItem value="RUB">₽ RUB</SelectItem>
                <SelectItem value="CNY">¥ CNY</SelectItem>
                {(['ETH','BTC','SOL','XRP','LTC','TRX'] as const).map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    <span className="inline-flex items-center gap-2 w-full">
                      {cryptoIcons[cur] && <img src={cryptoIcons[cur]!} alt={cur} className="w-4 h-4" />}
                      <span>{cur}</span>
                      <span className="bg-yellow-400/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded ml-auto">Crypto</span>
                      {cryptoRates[cur] > 0 ? (
                        <span className="text-xs text-opnskin-text-secondary ml-2">{cryptoRates[cur]} €</span>
                      ) : (
                        <span className="text-xs text-red-400 ml-2">Non listé</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {typeof cryptoRates === 'string' && (
              <div className="text-red-500 text-xs mt-2">{cryptoRates}</div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-opnskin-text-secondary hover:text-opnskin-text-primary"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-opnskin-accent rounded-full animate-pulse" />
                    )}
                  </Button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 p-4 rounded-lg bg-opnskin-bg-card/95 border border-opnskin-bg-secondary shadow-xl">
                      <h3 className="font-satoshi-bold mb-3 text-opnskin-text-primary">Notifications</h3>
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'p-3 rounded-md transition-colors',
                              notification.unread ? 'bg-opnskin-primary/10' : 'bg-transparent'
                            )}
                          >
                            <h4 className="font-satoshi-bold text-sm text-opnskin-text-primary">{notification.title}</h4>
                            <p className="text-sm text-opnskin-text-secondary">{notification.message}</p>
                            <span className="text-xs text-opnskin-text-secondary/60">{notification.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir vos notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-opnskin-text-secondary hover:text-opnskin-text-primary"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">{t('header.cart')}</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voir votre panier</p>
              </TooltipContent>
            </Tooltip>

            {/* Solde et bouton recharger - affichés uniquement si Steam est connecté */}
            {isSteamLinked && (
              <div className="flex items-center space-x-4 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-opnskin-text-secondary">{t('header.balance')}</span>
                  {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                  <span className="font-mono text-opnskin-accent font-medium">{formatPrice(solde, currency, cryptoRates)}</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="btn-opnskin"
                >
                  {t('header.recharge')}
                </Button>
              </div>
            )}

            {userLoading ? (
              <div className="text-opnskin-primary animate-pulse">Chargement…</div>
            ) : userError ? (
              <div className="text-red-500">Erreur de connexion</div>
            ) : user && user.loggedIn ? (
              <div className="relative flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-opnskin-text-primary">{user.name}</span>
                </div>
                <div className="relative">
                  <img
                    src={user.avatar || '/icons8-steam-128.png'}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full cursor-pointer border border-opnskin-bg-secondary hover:border-opnskin-primary/40 transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  />
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 bg-opnskin-bg-card/95 border border-opnskin-bg-secondary rounded-md shadow-xl z-50 w-40">
                      <button
                        className="w-full flex items-center px-4 py-2 text-sm text-opnskin-text-primary hover:bg-opnskin-primary/10 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button
                onClick={() => (window.location.href = '/api/auth/steam')}
                className="btn-opnskin flex items-center gap-2"
              >
                <img
                  src="/icons8-steam-128.png"
                  alt="Steam"
                  className="w-6 h-6 object-contain"
                />
                Connecter Steam
              </Button>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
