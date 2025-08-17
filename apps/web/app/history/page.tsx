"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Store, RefreshCw } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/components/UserProvider'
import { TransactionCard } from '@/components/TransactionCard'
import { StatusBadge } from '@/components/StatusBadge'
import { cn } from '@/lib/utils'

export default function HistoryPage() {
  const { t } = useTranslation('common')
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();

  const fetchTransactions = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const response = await fetch(`/api/transactions`);
      const data = await response.json();
      console.log('API /api/transactions:', data); // DEBUG
      if (data.transactions) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Abonnement temps réel pour acheteur et vendeur
  useEffect(() => {
    if (!user || !user.loggedIn || !user.id) return;
    const channel = supabase
      .channel(`tx-user-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Transaction', filter: `buyerId=eq.${user.id}` }, () => {
        fetchTransactions(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Transaction', filter: `sellerId=eq.${user.id}` }, () => {
        fetchTransactions(false);
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user]);

  const filterTx = {
    all: (tx: any) => true,
    purchases: (tx: any) => tx.isBuyer,
    sales: (tx: any) => tx.isSeller,
    pending: (tx: any) => tx.status === 'PENDING' || tx.status === 'IN_ESCROW',
  };

  const renderTxList = (tab: keyof typeof filterTx) => {
    const filtered = transactions.filter(filterTx[tab]);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <History className="animate-spin h-8 w-8 text-opnskin-primary mx-auto mb-4" />
            <p className="text-opnskin-text-secondary">Chargement des transactions...</p>
          </div>
        </div>
      );
    }
    
    if (filtered.length === 0) {
      return (
        <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
          <History className="h-12 w-12 md:h-16 md:w-16 text-opnskin-text-secondary mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">Aucune transaction</h2>
          <p className="text-opnskin-text-secondary mb-4 md:mb-6 max-w-md text-base md:text-lg">
            Tu n'as pas de transactions dans cette catégorie.
          </p>
          <Button className="btn-market w-full text-base md:text-lg">
            <Store className="mr-2 h-4 w-4" />
            Explorer la marketplace
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filtered.map((tx: any) => (
          <TransactionCard
            key={tx.id}
            transaction={tx}
            currency={currency}
            cryptoRates={cryptoRates}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">{t('history.title')}</h1>
            <p className="text-opnskin-text-secondary text-base md:text-lg">{t('history.subtitle')}</p>
          </div>
          
          {/* Bouton Rafraîchir avec animation */}
          <Button 
            onClick={() => fetchTransactions(false)} 
            disabled={refreshing}
            className="ml-2 bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 dark:bg-opnskin-blue dark:text-white dark:border-transparent dark:hover:bg-opnskin-blue/80 transition-all duration-200"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            {refreshing ? 'Actualisation...' : 'Rafraîchir'}
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-opnskin-bg-card/60 border border-opnskin-bg-secondary flex flex-wrap md:flex-nowrap">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue transition-all duration-200"
            >
              {t('history.tab_all')}
            </TabsTrigger>
            <TabsTrigger 
              value="purchases" 
              className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue transition-all duration-200"
            >
              {t('history.tab_purchases')}
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue transition-all duration-200"
            >
              {t('history.tab_sales')}
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue transition-all duration-200"
            >
              {t('history.tab_pending')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="all" 
            className="mt-4 md:mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {renderTxList('all')}
          </TabsContent>
          <TabsContent 
            value="purchases" 
            className="mt-4 md:mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {renderTxList('purchases')}
          </TabsContent>
          <TabsContent 
            value="sales" 
            className="mt-4 md:mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {renderTxList('sales')}
          </TabsContent>
          <TabsContent 
            value="pending" 
            className="mt-4 md:mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {renderTxList('pending')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
