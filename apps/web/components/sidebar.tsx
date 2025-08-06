"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Store, Package, ListOrdered, Wallet, History, User, Settings, ChevronRight, Home, Globe, ChevronDown, Phone, Shield, MessageCircle } from "lucide-react"
import { OPNSKINLogo } from "@/components/opnskin-logo"
import { useTranslation } from 'react-i18next'
import { useUser } from "@/components/UserProvider"

function SidebarContent() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { t, i18n } = useTranslation('common')
  const { user } = useUser()
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
        "h-screen bg-opnskin-bg-primary transition-all duration-500 ease-in-out flex flex-col relative overflow-hidden",
        expanded ? "w-64" : "w-28",
        mounted ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-opnskin-primary/5 via-transparent to-opnskin-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-700 z-0" />
      
      <div className="sidebar-logo-container px-4 flex items-center justify-between relative z-30" style={{ height: 80, minHeight: 80, maxHeight: 80 }}>
        <Link href="/" className="flex items-center gap-2 group">
          <OPNSKINLogo className="h-10 w-10 text-opnskin-primary transition-transform duration-300 group-hover:scale-110" />
          <div className={cn(
            "transition-all duration-500 ease-in-out overflow-hidden",
            expanded ? "opacity-100 max-w-32" : "opacity-0 max-w-0"
          )}>
            <span className="font-satoshi-bold text-xl text-opnskin-text-primary whitespace-nowrap">
              OPN<span className="text-opnskin-primary">SKIN</span>
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-opnskin-text-secondary hover:text-opnskin-text-primary hover:bg-opnskin-bg-secondary/50 transition-all duration-300 rounded-full z-40"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Réduire le menu" : "Agrandir le menu"}
        >
          <ChevronRight className={cn("h-5 w-5 transition-all duration-500 ease-in-out", !expanded && "rotate-180")} />
        </Button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto relative z-20">
        <nav className="space-y-1 px-2">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item h-12 flex items-center relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:bg-opnskin-bg-secondary/30",
                pathname === item.href ? "nav-item-active bg-opnskin-primary/10 border-l-2 border-opnskin-primary" : "nav-item-inactive"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Effet de survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-opnskin-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 z-0" />
              
              {expanded ? (
                <item.icon className="h-5 w-5 relative z-10 transition-transform duration-300 hover:scale-110" />
              ) : (
                <span className="sidebar-icon flex items-center justify-center w-10 h-10 relative z-10 transition-all duration-300 hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </span>
              )}
              <div className={cn(
                "relative z-10 transition-all duration-500 ease-in-out overflow-hidden",
                expanded ? "opacity-100 translate-x-0 ml-3 max-w-40" : "opacity-0 -translate-x-4 max-w-0"
              )}>
                <span className="whitespace-nowrap">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-opnskin-bg-secondary/50 relative">
          <div className={cn(
            "transition-all duration-500 ease-in-out overflow-hidden",
            expanded ? "opacity-100 max-h-8" : "opacity-0 max-h-0"
          )}>
            <h3 className="px-3 text-xs font-semibold text-opnskin-text-secondary uppercase mb-2">Compte & Support</h3>
          </div>
          <nav className="space-y-1 px-2">
            {accountItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item h-12 flex items-center relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:bg-opnskin-bg-secondary/30",
                  pathname === item.href ? "nav-item-active bg-opnskin-primary/10 border-l-2 border-opnskin-primary" : "nav-item-inactive"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
                style={{
                  animationDelay: `${(index + navItems.length) * 50}ms`
                }}
              >
                {/* Effet de survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-opnskin-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                {expanded ? (
                  <item.icon className="h-5 w-5 relative z-10 transition-transform duration-300 hover:scale-110" />
                ) : (
                  <span className="sidebar-icon flex items-center justify-center w-10 h-10 relative z-10 transition-all duration-300 hover:scale-110">
                    <item.icon className="h-5 w-5" />
                  </span>
                )}
                <div className={cn(
                  "relative z-10 transition-all duration-500 ease-in-out overflow-hidden",
                  expanded ? "opacity-100 translate-x-0 ml-3 max-w-40" : "opacity-0 -translate-x-4 max-w-0"
                )}>
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>
              </Link>
            ))}
            <div className="relative">
              <button
                className={cn(
                  "nav-item w-full text-left flex items-center relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:bg-opnskin-bg-secondary/30 h-12",
                  showLangs ? "nav-item-active bg-opnskin-primary/10 border-l-2 border-opnskin-primary" : "nav-item-inactive"
                )}
                onClick={() => setShowLangs(v => !v)}
                aria-expanded={showLangs}
              >
                {/* Effet de survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-opnskin-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                {expanded ? (
                  <Globe className="h-5 w-5 relative z-10 transition-transform duration-300 hover:scale-110" />
                ) : (
                  <span className="sidebar-icon flex items-center justify-center w-10 h-10 relative z-10 transition-all duration-300 hover:scale-110">
                    <Globe className="h-5 w-5" />
                  </span>
                )}
                <div className={cn(
                  "relative z-10 transition-all duration-500 ease-in-out overflow-hidden",
                  expanded ? "opacity-100 translate-x-0 ml-3 max-w-40" : "opacity-0 -translate-x-4 max-w-0"
                )}>
                  <span className="whitespace-nowrap">{t('sidebar.language')}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 ml-auto relative z-10 transition-all duration-300", showLangs && "rotate-180", !expanded && "hidden")}/>
              </button>
              <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                showLangs ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="flex flex-col gap-1 mt-1 ml-2">
                  {languages.map((lang, index) => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setShowLangs(false); }}
                      className={cn(
                        "nav-item w-full text-left pl-10 relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:bg-opnskin-bg-secondary/30 h-10",
                        currentLang === lang.code ? "nav-item-active bg-opnskin-primary/10 border-l-2 border-opnskin-primary" : "nav-item-inactive"
                      )}
                      aria-current={currentLang === lang.code ? "true" : undefined}
                      style={{
                        animationDelay: `${index * 30}ms`
                      }}
                    >
                      {/* Effet de survol */}
                      <div className="absolute inset-0 bg-gradient-to-r from-opnskin-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      
                      <span className="text-lg relative z-10">{lang.flag}</span>
                      <span className="text-sm font-medium relative z-10 ml-2">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Section Admin - Visible uniquement pour les admins */}
        {user?.isAdmin && (
          <div className="mt-6 pt-6 border-t border-opnskin-bg-secondary/50 relative z-20">
            <div className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              expanded ? "opacity-100 max-h-8" : "opacity-0 max-h-0"
            )}>
              <h3 className="px-3 text-xs font-semibold text-opnskin-text-secondary uppercase mb-2">Administration</h3>
            </div>
            <nav className="space-y-1 px-2">
              <Link
                href="/admin/support"
                className={cn(
                  "nav-item h-12 flex items-center relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:bg-opnskin-bg-secondary/30",
                  pathname === "/admin/support" ? "nav-item-active bg-opnskin-primary/10 border-l-2 border-opnskin-primary" : "nav-item-inactive"
                )}
                aria-current={pathname === "/admin/support" ? "page" : undefined}
              >
                {/* Effet de survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-opnskin-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 z-0" />
                
                {expanded ? (
                  <MessageCircle className="h-5 w-5 relative z-10 transition-transform duration-300 hover:scale-110" />
                ) : (
                  <span className="sidebar-icon flex items-center justify-center w-10 h-10 relative z-10 transition-all duration-300 hover:scale-110">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                )}
                <div className={cn(
                  "relative z-10 transition-all duration-500 ease-in-out overflow-hidden",
                  expanded ? "opacity-100 translate-x-0 ml-3 max-w-40" : "opacity-0 -translate-x-4 max-w-0"
                )}>
                  <span className="whitespace-nowrap">Support Admin</span>
                </div>
              </Link>
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 relative z-30">
        <div className="relative">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-opnskin-primary/20 to-opnskin-primary-hover/20 backdrop-blur-lg border border-opnskin-primary/20 transition-all duration-500 ease-in-out hover:from-opnskin-primary/30 hover:to-opnskin-primary-hover/30",
              expanded ? "justify-between" : "justify-center",
            )}
          >
            {expanded ? (
              <>
                <div className="flex flex-col transition-all duration-300">
                  <span className="text-xs text-opnskin-text-secondary">{t('sidebar.level', 'Niveau')}</span>
                  <span className="font-satoshi-bold text-opnskin-text-primary">0</span>
                </div>
                <div className="flex flex-col items-end transition-all duration-300">
                  <span className="text-xs text-opnskin-text-secondary">{t('sidebar.xp', 'XP')}</span>
                  <span className="font-mono text-opnskin-accent">0/100</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center transition-all duration-300">
                <span className="font-satoshi-bold text-opnskin-text-primary text-sm">0</span>
                <span className="text-xs text-opnskin-text-secondary">{t('sidebar.level', 'Niveau')}</span>
              </div>
            )}
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-white bg-black/40 rounded-lg pointer-events-none">
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
