import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import I18nProvider from '@/components/I18nProvider'
import { UserProvider } from '@/components/UserProvider'
import { FloatProvider } from '@/components/FloatProvider'
import { InventoryProvider } from '@/components/InventoryProvider'
import { Toaster } from '@/components/ui/toaster'
import UserPresencePinger from '@/components/UserPresencePinger'
import ScrollToTop from '@/components/ScrollToTop'
import { usePingPresence } from './hooks/use-ping-presence';
import MobileLayout from '@/components/MobileLayout';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OPNSKIN - Marketplace de Skins Gaming | Achetez et Vendez des Skins CS2, Dota 2, Rust, TF2',
  description: 'OPNSKIN est la marketplace de confiance pour acheter et vendre des skins gaming. Skins CS2, Dota 2, Rust, TF2 en toute sécurité. Trading rapide et fiable.',
  keywords: 'skins, gaming, CS2, Dota 2, Rust, TF2, marketplace, trading, OPNSKIN, Counter-Strike, Steam, skins gaming, acheter skins, vendre skins',
  authors: [{ name: 'OPNSKIN Team' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'OPNSKIN - Marketplace de Skins Gaming',
    description: 'La marketplace de confiance pour tous vos besoins numériques. Achetez et vendez des skins CS2, Dota 2, Rust, TF2 en toute sécurité.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.opnskin.com',
    siteName: 'OPNSKIN',
    images: [
      {
        url: '/logo-OPNSKIN.png',
        width: 1200,
        height: 630,
        alt: 'OPNSKIN - Marketplace de Skins Gaming',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPNSKIN - Marketplace de Skins Gaming',
    description: 'La marketplace de confiance pour tous vos besoins numériques',
    images: ['/logo-OPNSKIN.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code', // Remplacez par votre code de vérification Google
  },
  alternates: {
    canonical: 'https://www.opnskin.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/locales/fr/common.json" as="fetch" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.opnskin.com" />
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="icon" type="image/png" href="/favicon.png?v=3" />
        <link rel="manifest" href="/site.webmanifest?v=3" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Données structurées JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "OPNSKIN",
              "description": "Marketplace de skins gaming - Achetez et vendez des skins CS2, Dota 2, Rust, TF2",
              "url": "https://www.opnskin.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.opnskin.com/marketplace?search={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://twitter.com/opnskin",
                "https://discord.gg/opnskin"
              ]
            })
          }}
        />
        
        {/* Axeptio Script - Chargement direct pour assurer l'affichage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.axeptioSettings = {
                clientId: "689390aba5e74449ee8b9c58",
                cookiesVersion: "opnskin-fr-EU",
                googleConsentMode: {
                  default: {
                    analytics_storage: "denied",
                    ad_storage: "denied",
                    ad_user_data: "denied",
                    ad_personalization: "denied",
                    wait_for_update: 500
                  }
                }
              };
              
              void 0 === window._axcb && (window._axcb = []);
              window._axcb.push(function(axeptio) {
                axeptio.on("cookies:complete", function(choices) {
                  console.log('🍪 Axeptio - Choix utilisateur:', choices);
                });
              });
              
              (function(d, s) {
                var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
                e.async = true; e.src = "//static.axept.io/sdk.js";
                t.parentNode.insertBefore(e, t);
              })(document, "script");
            `,
          }}
        />
        
        {/* Google Analytics - Chargement conditionnel après consentement */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX'); // Remplacez par votre ID Google Analytics
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
      </head>
      <body className={`${inter.className} bg-opnskin-bg-primary text-opnskin-text-primary antialiased`}>
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
