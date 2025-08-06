import type React from "react"
import type { Metadata } from "next"
import { Poppins, Sora, Share_Tech_Mono, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import Link from 'next/link'
import I18nProvider from "@/components/I18nProvider"
import ScrollToTop from '@/components/ScrollToTop'
import { UserProvider } from "@/components/UserProvider"
import { InventoryProvider } from "@/components/InventoryProvider"
import { FloatProvider } from "@/components/FloatProvider"
import MobileLayout from '@/components/MobileLayout'
import { Toaster } from "@/components/ui/toaster"
import { usePingPresence } from './hooks/use-ping-presence';
import UserPresencePinger from '@/components/UserPresencePinger';

// Utilisation de Poppins comme alternative à Satoshi Bold
const satoshiBold = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-satoshi-bold",
})

// Utilisation de Sora comme alternative à Satoshi Regular
const satoshiRegular = Sora({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-satoshi-regular",
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono",
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OPNSKIN - Marketplace de Skins Gaming",
  description: "La marketplace de confiance pour tous vos besoins numériques. Sécurisé, rapide et fiable.",
  keywords: "skins, gaming, CS2, Dota 2, marketplace, trading, OPNSKIN",
  authors: [{ name: "OPNSKIN Team" }],
  openGraph: {
    title: "OPNSKIN - Marketplace de Skins Gaming",
    description: "La marketplace de confiance pour tous vos besoins numériques",
    type: "website",
    locale: "fr_FR",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Précharger les ressources critiques */}
        <link rel="preload" href="/locales/fr/common.json" as="fetch" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.opnskin.com" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${satoshiBold.variable} ${satoshiRegular.variable} ${shareTechMono.variable} ${inter.className} font-sans bg-background`}>
        <I18nProvider>
          <UserProvider>
            <UserPresencePinger />
            <ScrollToTop />
            <InventoryProvider>
              <FloatProvider>
                {/* Mobile layout */}
                <div className="md:hidden w-full h-full min-h-screen">
                  <MobileLayout>{children}</MobileLayout>
                </div>
                {/* Desktop layout */}
                <div className="hidden md:flex h-screen bg-opnskin-bg-primary">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto bg-opnskin-bg-primary">
                      {children}
                    </main>
                  </div>
                </div>
                <Toaster />
              </FloatProvider>
            </InventoryProvider>
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
