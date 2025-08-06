import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import I18nProvider from '@/components/I18nProvider'
import { UserProvider } from '@/components/UserProvider'
import { FloatProvider } from '@/components/FloatProvider'
import { InventoryProvider } from '@/components/InventoryProvider'
import { AxeptioProvider } from '@/components/AxeptioProvider'
import { Toaster } from '@/components/ui/toaster'
import UserPresencePinger from '@/components/UserPresencePinger'
import ScrollToTop from '@/components/ScrollToTop'
import { usePingPresence } from './hooks/use-ping-presence';
import MobileLayout from '@/components/MobileLayout';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OPNSKIN - Marketplace de Skins Gaming',
  description: 'La marketplace de confiance pour tous vos besoins numériques',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
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
      </head>
      <body className={`${inter.className} bg-opnskin-bg-primary text-opnskin-text-primary antialiased`}>
        <I18nProvider>
          <UserProvider>
            <AxeptioProvider>
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
            </AxeptioProvider>
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
