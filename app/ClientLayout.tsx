"use client";
import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import I18nProvider from "@/components/I18nProvider";
import ScrollToTop from '@/components/ScrollToTop';
import { UserProvider } from "@/components/UserProvider";
import { InventoryProvider } from "@/components/InventoryProvider";
import { FloatProvider } from "@/components/FloatProvider";
import MobileLayout from '@/components/MobileLayout';
import { Toaster } from "@/components/ui/toaster";
import { usePingPresence } from './hooks/use-ping-presence';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  usePingPresence();
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ScrollToTop />
        <I18nProvider>
        <UserProvider>
        <InventoryProvider>
        <FloatProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
        </FloatProvider>
        </InventoryProvider>
        </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
} 