import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import I18nProvider from '@/components/I18nProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/components/UserProvider'
import { FloatProvider } from '@/components/FloatProvider'
import { InventoryProvider } from '@/components/InventoryProvider'
import { Toaster } from '@/components/ui/toaster'
import NotificationsLive from '@/components/NotificationsLive'
import UserPresencePinger from '@/components/UserPresencePinger'
import ScrollToTop from '@/components/ScrollToTop'
import { usePingPresence } from './hooks/use-ping-presence';
import MobileLayout from '@/components/MobileLayout';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OPNSKIN - Marketplace de Skins Gaming',
  description: 'La marketplace de confiance pour tous vos besoins numériques. Achetez et vendez des skins CS2, Dota 2, Rust, TF2 en toute sécurité.',
  keywords: 'skins, gaming, CS2, Dota 2, Rust, TF2, marketplace, trading, OPNSKIN, Counter-Strike, Steam',
  authors: [{ name: 'OPNSKIN Team' }],
  robots: 'index, follow',
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
              
              // Fonction pour ouvrir les préférences de cookies
              window.openAxeptioCookies = function() {
                if (window.axeptio) {
                  window.axeptio.show();
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
                <NotificationsLive />
                <Toaster />
              </FloatProvider>
            </InventoryProvider>
          </UserProvider>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
