"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Store } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';

export default function HistoryPage() {
  const { t } = useTranslation('common')
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/transactions`);
        const data = await response.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'WAITING_TRADE': { label: 'En attente', color: 'bg-yellow-500' },
      'DONE': { label: 'Terminée', color: 'bg-green-500' },
      'REFUSED': { label: 'Refusée', color: 'bg-red-500' },
      'EXPIRED': { label: 'Expirée', color: 'bg-gray-500' },
      'REFUNDED_PENALTY': { label: 'Remboursée', color: 'bg-orange-500' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${config.color}`}>{config.label}</span>
    );
  };

  const getInstructions = (transaction: any) => {
    if (transaction.isBuyer) {
      if (transaction.status === 'WAITING_TRADE') {
        return <div className="text-yellow-400 text-xs mt-2">En attente d’envoi du skin par le vendeur. Vous recevrez une notification dès que le skin sera livré.</div>;
      }
      if (transaction.status === 'DONE') {
        return <div className="text-green-400 text-xs mt-2">Transaction terminée. Le skin a été livré et l’argent a été libéré.</div>;
      }
    } else if (transaction.isSeller) {
      if (transaction.status === 'WAITING_TRADE') {
        if (transaction.offer && transaction.offer.buyer && transaction.offer.buyer.tradeUrl) {
          return <div className="text-blue-400 text-xs mt-2">Vous devez envoyer le skin à l’acheteur via Steam. Cliquez sur « Lancer l’échange Steam » pour ouvrir son tradelink. L’argent sera libéré automatiquement dès que le skin sera détecté dans l’inventaire de l’acheteur.</div>;
        } else {
          return <div className="text-yellow-400 text-xs mt-2">L’acheteur n’a pas encore renseigné son tradelink Steam. Attendez qu’il le fasse pour pouvoir envoyer le skin.</div>;
        }
      }
      if (transaction.status === 'DONE') {
        return <div className="text-green-400 text-xs mt-2">Transaction terminée. Le skin a été livré et l’argent a été libéré.</div>;
      }
    }
    return null;
  };

  const filterTx = {
    all: (tx: any) => true,
    purchases: (tx: any) => tx.isBuyer,
    sales: (tx: any) => tx.isSeller,
    pending: (tx: any) => tx.status === 'WAITING_TRADE',
  };

  const renderTxList = (tab: keyof typeof filterTx) => {
    const filtered = transactions.filter(filterTx[tab]);
    if (loading) {
      return <div className="flex items-center justify-center py-12"><History className="animate-spin h-8 w-8 text-opnskin-primary" /></div>;
    }
    if (filtered.length === 0) {
      return (
        <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
          <History className="h-12 w-12 md:h-16 md:w-16 text-white/30 mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">Aucune transaction</h2>
          <p className="text-white/70 mb-4 md:mb-6 max-w-md text-base md:text-lg">Tu n'as pas de transactions dans cette catégorie.</p>
          <Button className="bg-kalpix-violet hover:bg-kalpix-violet/80 w-full text-base md:text-lg">
            <Store className="mr-2 h-4 w-4" />
            Explorer la marketplace
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {filtered.map((tx: any) => (
          <Card key={tx.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-opnskin-text-primary">{tx.offer?.itemName || tx.offer?.itemId}</h3>
                    {getStatusBadge(tx.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-opnskin-text-secondary">
                    <div>
                      <span className="font-semibold">Prix:</span> {formatPrice(tx.escrowAmount, currency, cryptoRates)}
                    </div>
                    <div>
                      <span className="font-semibold">Date:</span> {new Date(tx.startedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Rôle:</span> {tx.isBuyer ? 'Acheteur' : 'Vendeur'}
                    </div>
                    {tx.isSeller && tx.offer?.transaction?.buyer && (
                      <div>
                        <span className="font-semibold">Acheteur:</span> {tx.offer.transaction.buyer.name}
                      </div>
                    )}
                    {tx.isBuyer && tx.offer?.seller && (
                      <div>
                        <span className="font-semibold">Vendeur:</span> {tx.offer.seller.name}
                      </div>
                    )}
                  </div>
                  {getInstructions(tx)}
                </div>
              </div>
            </CardContent>
          </Card>
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
            <p className="text-white/70 text-base md:text-lg">{t('history.subtitle')}</p>
          </div>
        </div>
        <Tabs defaultValue="all">
          <TabsList className="bg-black/40 border border-white/10 flex flex-wrap md:flex-nowrap">
            <TabsTrigger value="all" className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue">{t('history.tab_all')}</TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue">{t('history.tab_purchases')}</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue">{t('history.tab_sales')}</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue">{t('history.tab_pending')}</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 md:mt-6">{renderTxList('all')}</TabsContent>
          <TabsContent value="purchases" className="mt-4 md:mt-6">{renderTxList('purchases')}</TabsContent>
          <TabsContent value="sales" className="mt-4 md:mt-6">{renderTxList('sales')}</TabsContent>
          <TabsContent value="pending" className="mt-4 md:mt-6">{renderTxList('pending')}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
