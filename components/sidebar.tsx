"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Store, Package, ListOrdered, Wallet, History, User, Settings, ChevronRight, Home, Globe, ChevronDown, Phone } from "lucide-react"
import { OPNSKINLogo } from "@/components/kalpix-logo"
import { useTranslation } from 'next-i18next'

function SidebarContent() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { t, i18n } = useTranslation('common')
  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ]
  const currentLang = i18n.language || 'fr'
  const [showLangs, setShowLangs] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    {
      name: t('sidebar.marketplace'),
      href: "/marketplace",
      icon: Store,
    },
    {
      name: t('sidebar.inventory'),
      href: "/inventory",
      icon: Package,
    },
    {
      name: t('sidebar.listings'),
      href: "/listings",
      icon: ListOrdered,
    },
    {
      name: t('sidebar.wallet'),
      href: "/wallet",
      icon: Wallet,
    },
    {
      name: t('sidebar.history'),
      href: "/history",
      icon: History,
    },
  ]

  const accountItems = [
    {
      name: t('sidebar.profile'),
      href: "/profile",
      icon: User,
    },
    {
      name: t('sidebar.assistance', 'Assistance'),
      href: "/assistance",
      icon: Phone,
    },
  ]

  return (
    <div
      className={cn(
        "h-screen bg-opnskin-bg-primary transition-all flex flex-col",
        expanded ? "w-64" : "w-28",
        mounted ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="sidebar-logo-container px-4 flex items-center justify-between" style={{ height: 80, minHeight: 80, maxHeight: 80 }}>
        <Link href="/" className="flex items-center gap-2 group">
          <OPNSKINLogo className="h-10 w-10 text-opnskin-primary transition-transform group-hover:scale-110" />
          {expanded && (
            <span className="font-satoshi-bold text-xl text-opnskin-text-primary">
              OPN<span className="text-opnskin-primary">SKIN</span>
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-opnskin-text-secondary hover:text-opnskin-text-primary transition-colors"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Réduire le menu" : "Agrandir le menu"}
        >
          <ChevronRight className={cn("h-5 w-5 transition-transform", !expanded && "rotate-180")} />
        </Button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", pathname === item.href ? "nav-item-active" : "nav-item-inactive")}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span
                className={cn(
                  "inline-block transition-all duration-300",
                  expanded
                    ? "opacity-100 translate-x-0 ml-2"
                    : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                )}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-opnskin-bg-secondary">
          <h3 className={cn("px-3 text-xs font-semibold text-opnskin-text-secondary uppercase mb-2", !expanded && "sr-only")}>
            {t('sidebar.profile')}
          </h3>
          <nav className="space-y-1 px-2">
            {accountItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("nav-item", pathname === item.href ? "nav-item-active" : "nav-item-inactive")}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span
                  className={cn(
                    "inline-block transition-all duration-300",
                    expanded
                      ? "opacity-100 translate-x-0 ml-2"
                      : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            ))}
            <div className="relative">
              <button
                className={cn(
                  "nav-item w-full text-left flex items-center gap-2",
                  showLangs ? "nav-item-active" : "nav-item-inactive"
                )}
                onClick={() => setShowLangs(v => !v)}
                aria-expanded={showLangs}
              >
                <Globe className="h-5 w-5" />
                <span
                  className={cn(
                    "inline-block transition-all duration-300",
                    expanded
                      ? "opacity-100 translate-x-0 ml-2"
                      : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                  )}
                >
                  {t('sidebar.language')}
                </span>
                <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", showLangs && "rotate-180", !expanded && "hidden")}/>
              </button>
              {showLangs && (
                <div className="flex flex-col gap-1 mt-1 ml-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setShowLangs(false); }}
                      className={cn(
                        "nav-item w-full text-left pl-10",
                        currentLang === lang.code ? "nav-item-active" : "nav-item-inactive"
                      )}
                      aria-current={currentLang === lang.code ? "true" : undefined}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md bg-gradient-to-r from-opnskin-primary to-opnskin-primary-hover transition-all backdrop-blur-lg opacity-40",
              expanded ? "justify-between" : "justify-center",
            )}
          >
            {expanded ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-opnskin-text-secondary">{t('sidebar.level', 'Niveau')}</span>
                  <span className="font-satoshi-bold text-opnskin-text-primary">0</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-opnskin-text-secondary">{t('sidebar.xp', 'XP')}</span>
                  <span className="font-mono text-opnskin-accent">0/100</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-satoshi-bold text-opnskin-text-primary">0</span>
                <span className="text-xs text-opnskin-text-secondary">{t('sidebar.level', 'Niveau')}</span>
              </div>
            )}
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-white bg-black/40 rounded pointer-events-none">
            {t('sidebar.coming_soon', 'Coming Soon')}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-opnskin-bg-primary w-64 flex flex-col">
        <div className="sidebar-logo-container px-4 flex items-center justify-between" style={{ height: 80, minHeight: 80, maxHeight: 80 }}>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-opnskin-primary/20 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-opnskin-text-secondary/20 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 py-4 px-2 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-opnskin-bg-secondary/20 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <SidebarContent />
    </Suspense>
  );
}
