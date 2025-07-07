'use client';

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListOrdered, Package, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function Listings() {
  const { t } = useTranslation('common');
  const currency = useCurrencyStore((state) => state.currency);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">{t('listings.title')}</h1>
            <p className="text-white/70 text-base md:text-lg">{t('listings.subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="bg-black/40 border border-white/10 flex flex-wrap md:flex-nowrap">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('listings.tab_active')}
            </TabsTrigger>
            <TabsTrigger
              value="sold"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('listings.tab_sold')}
            </TabsTrigger>
            <TabsTrigger
              value="expired"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('listings.tab_expired')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <ListOrdered className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('listings.no_active')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('listings.no_active_desc')}</p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full max-w-xs mx-auto">
                <Button className="bg-kalpix-violet hover:bg-kalpix-violet/80 w-full text-base md:text-lg">
                  <Package className="mr-2 h-4 w-4" />
                  {t('listings.go_inventory')}
                </Button>
                <Button variant="outline" className="border-kalpix-blue text-kalpix-blue hover:bg-kalpix-blue/10 w-full text-base md:text-lg">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {t('listings.explore_marketplace')}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sold" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <ListOrdered className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('listings.no_sold')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('listings.no_sold_desc')}</p>
              <Button variant="outline" className="border-kalpix-blue text-kalpix-blue hover:bg-kalpix-blue/10 w-full text-base md:text-lg">
                <ArrowRight className="mr-2 h-4 w-4" />
                {t('listings.explore_marketplace')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="expired" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <ListOrdered className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('listings.no_expired')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('listings.no_expired_desc')}</p>
              <Button variant="outline" className="border-kalpix-blue text-kalpix-blue hover:bg-kalpix-blue/10 w-full text-base md:text-lg">
                <ArrowRight className="mr-2 h-4 w-4" />
                {t('listings.explore_marketplace')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
