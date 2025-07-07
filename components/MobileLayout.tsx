"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import { OPNSKINLogo } from '@/components/kalpix-logo';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import SteamAuthStatus from '@/components/SteamAuthStatus';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t, i18n } = useTranslation('common');
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
          {/* Sélecteur de langue rapide (icône globe ou flag) */}
          <div className="relative">
            <button
              aria-label="Changer de langue"
              className="p-2 rounded text-opnskin-primary focus:outline-none focus:ring-2 focus:ring-opnskin-primary"
              onClick={() => setOpen(l => !l)}
            >
              <span className="text-xl">{languages.find(l => l.code === currentLang)?.flag || '🌐'}</span>
            </button>
            {/* Menu langues rapide (affiché si drawer fermé) */}
            {!open && (
              <div className="absolute right-0 mt-2 bg-opnskin-bg-card border border-opnskin-bg-secondary rounded shadow-lg z-50 flex flex-col min-w-[120px]">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm ${currentLang === lang.code ? 'bg-opnskin-primary/20 text-opnskin-primary' : 'text-opnskin-text-primary hover:bg-opnskin-bg-secondary/60'}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Auth Steam */}
          <div className="ml-2">
            <SteamAuthStatus />
          </div>
          <DrawerTrigger asChild>
            <button aria-label="Ouvrir le menu" className="p-2 rounded text-opnskin-primary focus:outline-none focus:ring-2 focus:ring-opnskin-primary ml-2">
              <Menu className="h-7 w-7" />
            </button>
          </DrawerTrigger>
        </div>
      </div>
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto px-2 py-2 bg-opnskin-bg-primary">
        {children}
      </main>
    </div>
  );
} 