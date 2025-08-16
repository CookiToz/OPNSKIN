"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import { OPNSKINLogo } from '@/components/opnskin-logo';
import { Menu, X, ShoppingCart, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SteamAuthStatus from '@/components/SteamAuthStatus';
import { ThemeToggle } from '@/components/theme-toggle';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRates } from '@/hooks/use-crypto-rates';
import { cryptoIcons } from '@/lib/utils';
import { useCartStore } from '@/hooks/use-cart-store';
import { useUser } from "@/components/UserProvider";
import CartDrawer from "@/components/CartDrawer";
// import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/hooks/use-search-store';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t, ready, i18n } = useTranslation('common');
  const pathname = usePathname();
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Currency and cart stores
  const { currency, setCurrency } = useCurrencyStore();
  const cartItems = useCartStore((state) => state.items);
  const { user } = useUser();
  const rawCryptoRates = useCryptoRates();
  const cryptoRates = typeof rawCryptoRates === 'object' && rawCryptoRates !== null ? rawCryptoRates : { ETH: 0, GMC: 0, BTC: 0, SOL: 0, XRP: 0, LTC: 0, TRX: 0 };

  // Load notifications
  React.useEffect(() => {
    if (user && user.loggedIn) {
      fetch('/api/notifications?unread=true&limit=5')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
          }
        })
        .catch(error => {
          console.error('Erreur lors du chargement des notifications:', error);
        });
    }
  }, [user]);

  // Attendre que les traductions soient prêtes
  if (!ready) {
    return (
      <div className="md:hidden w-full h-full min-h-screen flex flex-col bg-opnskin-bg-primary">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-opnskin-primary mx-auto mb-4"></div>
            <p className="text-opnskin-text-secondary">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];
  const currentLang = i18n.language || 'fr';

  const navItems = [
    { name: t('sidebar.marketplace'), href: '/marketplace' },
    { name: t('sidebar.inventory'), href: '/inventory' },
    { name: t('sidebar.listings'), href: '/listings' },
    { name: t('sidebar.wallet'), href: '/wallet' },
    { name: t('sidebar.history'), href: '/history' },
  ];
  const accountItems = [
    { name: t('sidebar.profile'), href: '/profile' },
    { name: t('sidebar.assistance', 'Assistance'), href: '/assistance' },
  ];

  return (
    <div className="md:hidden w-full h-full min-h-screen flex flex-col bg-opnskin-bg-primary">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-opnskin-bg-secondary bg-opnskin-bg-primary">
        <Link href="/" className="flex items-center gap-2">
          <OPNSKINLogo className="h-8 w-8 text-opnskin-primary" />
          <span className="font-satoshi-bold text-lg text-opnskin-text-primary">OPN<span className="text-opnskin-primary">SKIN</span></span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Toggle thème (mobile) */}
          <div className="ml-1">
            <ThemeToggle />
          </div>
          {/* Auth Steam */}
          <div className="ml-2">
            <SteamAuthStatus />
          </div>
          {/* Drawer menu latéral */}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <button aria-label="Ouvrir le menu" className="p-2 rounded text-opnskin-primary focus:outline-none focus:ring-2 focus:ring-opnskin-primary ml-2">
                <Menu className="h-7 w-7" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="!rounded-t-none !h-full !max-h-none !top-0 !bottom-0 !left-0 !right-0 !fixed !w-4/5 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-4 border-b border-opnskin-bg-secondary sticky top-0 bg-opnskin-bg-primary z-10">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                  <OPNSKINLogo className="h-8 w-8 text-opnskin-primary" />
                  <span className="font-satoshi-bold text-lg text-opnskin-text-primary">OPN<span className="text-opnskin-primary">SKIN</span></span>
                </Link>
                <button aria-label="Fermer le menu" className="p-2 rounded text-opnskin-primary" onClick={() => setOpen(false)}>
                  <X className="h-7 w-7" />
                </button>
              </div>
              <nav className="flex flex-col gap-2 px-4 py-6 pb-24 overflow-y-auto">
                {/* Currency Selector - Mobile */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-opnskin-text-secondary mb-2">
                    Devise
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full bg-opnskin-bg-secondary border-opnskin-primary/30 text-opnskin-accent font-bold">
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
                </div>

                {/* Cart and Notifications - Mobile */}
                {user && user.loggedIn && (
                  <div className="flex gap-2 mb-4">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded bg-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/80 transition-colors"
                      onClick={() => { setCartOpen(true); setOpen(false); }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="text-sm font-medium">Panier</span>
                      {cartItems.length > 0 && (
                        <span className="bg-opnskin-accent text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold">
                          {cartItems.length}
                        </span>
                      )}
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded bg-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/80 transition-colors"
                      onClick={() => { setShowNotifications(!showNotifications); }}
                    >
                      <Bell className="h-5 w-5" />
                      <span className="text-sm font-medium">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-opnskin-accent text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Navigation Items */}
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`py-3 px-3 rounded text-base font-medium ${pathname === item.href ? 'bg-opnskin-primary/10 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                  >
                    {item.name}
                  </Link>
                ))}
                {accountItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`py-3 px-3 rounded text-base font-medium ${pathname === item.href ? 'bg-opnskin-primary/10 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-opnskin-bg-secondary my-3" />
                
                {/* Sélecteur de langue (mobile uniquement) */}
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${currentLang === lang.code ? 'bg-opnskin-primary/20 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      
      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute top-14 right-4 w-80 p-4 rounded-lg bg-opnskin-bg-card/95 border border-opnskin-bg-secondary shadow-xl z-50">
          <h3 className="font-satoshi-bold mb-3 text-opnskin-text-primary">Notifications</h3>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-opnskin-text-secondary">Aucune notification</p>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md transition-colors ${!notification.read ? 'bg-opnskin-primary/10' : 'bg-transparent'}`}
                >
                  <h4 className="font-satoshi-bold text-sm text-opnskin-text-primary">{notification.title}</h4>
                  <p className="text-sm text-opnskin-text-secondary">{notification.message}</p>
                  <span className="text-xs text-opnskin-text-secondary/60">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
            <div className="flex gap-2 pt-2 border-t border-opnskin-bg-secondary/30">
              <Link href="/notifications" className="flex-1">
                <button className="w-full px-3 py-2 text-sm border border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10 rounded">
                  Voir toutes les notifications
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto px-2 py-2 bg-opnskin-bg-primary">
        {children}
      </main>
      
      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
} 