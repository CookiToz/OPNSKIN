"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Store } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'

export default function HistoryPage() {
  const { t } = useTranslation('common')
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">{t('history.title')}</h1>
            <p className="text-white/70 text-base md:text-lg">{t('history.subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-black/40 border border-white/10 flex flex-wrap md:flex-nowrap">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('history.tab_all')}
            </TabsTrigger>
            <TabsTrigger
              value="purchases"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('history.tab_purchases')}
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('history.tab_sales')}
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
            >
              {t('history.tab_pending')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <History className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('history.no_transaction')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('history.no_transaction_desc')}</p>
              <Button className="bg-kalpix-violet hover:bg-kalpix-violet/80 w-full text-base md:text-lg">
                <Store className="mr-2 h-4 w-4" />
                {t('history.explore_marketplace')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <History className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('history.no_purchase')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('history.no_purchase_desc')}</p>
              <Button className="bg-kalpix-violet hover:bg-kalpix-violet/80 w-full text-base md:text-lg">
                <Store className="mr-2 h-4 w-4" />
                {t('history.explore_marketplace')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <History className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('history.no_sale')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('history.no_sale_desc')}</p>
              <Button className="bg-kalpix-violet hover:bg-kalpix-violet/80 w-full text-base md:text-lg">
                <Store className="mr-2 h-4 w-4" />
                {t('history.explore_marketplace')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4 md:mt-6">
            <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <History className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">{t('history.no_pending')}</h2>
              <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">{t('history.no_pending_desc')}</p>
              <Button className="bg-kalpix-violet hover:bg-kalpix-violet/80 w-full text-base md:text-lg">
                <Store className="mr-2 h-4 w-4" />
                {t('history.explore_marketplace')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
