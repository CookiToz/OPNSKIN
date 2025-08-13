"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import { OPNSKINLogo } from '@/components/opnskin-logo';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import SteamAuthStatus from '@/components/SteamAuthStatus';
import { ThemeToggle } from '@/components/theme-toggle';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
// import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/hooks/use-search-store';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t, ready, i18n } = useTranslation('common');
  const pathname = usePathname();
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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
        {/* Barre de recherche supprimée sur mobile pour Marketplace / Inventaire */}
        <div className="flex items-center gap-2">
          {/* Sélecteur de langue rapide (icône globe ou flag) */}
          <Popover open={langMenuOpen} onOpenChange={setLangMenuOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Changer de langue"
                className="p-2 rounded text-opnskin-primary focus:outline-none focus:ring-2 focus:ring-opnskin-primary"
                type="button"
              >
                <span className="text-xl">{languages.find(l => l.code === currentLang)?.flag || '🌐'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-36">
              <div className="flex flex-col">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-left w-full ${currentLang === lang.code ? 'bg-opnskin-primary/20 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
              <nav className="flex flex-col gap-2 px-4 py-6 pb-24">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`py-3 px-3 rounded text-base font-medium ${pathname === item.href ? 'bg-opnskin-primary/10 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-opnskin-bg-secondary my-3" />
                {accountItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`py-3 px-3 rounded text-base font-medium ${pathname === item.href ? 'bg-opnskin-primary/10 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-opnskin-bg-secondary my-3" />
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
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto px-2 py-2 bg-opnskin-bg-primary">
        {children}
      </main>
    </div>
  );
} 