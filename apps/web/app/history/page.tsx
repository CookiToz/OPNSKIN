"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, Store, Clock, ShieldCheck, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/components/UserProvider'

export default function HistoryPage() {
  const { t } = useTranslation('common')
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchTransactions = async () => {
    setLoading(true);
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
        fetchTransactions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Transaction', filter: `sellerId=eq.${user.id}` }, () => {
        fetchTransactions();
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'En attente', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', Icon: Clock },
      IN_ESCROW: { label: 'En escrow', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', Icon: ShieldCheck },
      RELEASED: { label: 'Terminée', color: 'bg-green-500/15 text-green-400 border-green-500/30', Icon: CheckCircle2 },
      REFUNDED: { label: 'Remboursée', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', Icon: XCircle },
      CANCELLED: { label: 'Annulée', color: 'bg-gray-500/15 text-gray-300 border-gray-500/30', Icon: XCircle },
    };
    const cfg = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', Icon: Clock } as any;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-semibold ${cfg.color}`}>
        <cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}
      </span>
    );
  };

  const renderTimeline = (status: string) => {
    const steps = [
      { key: 'PENDING', label: 'En attente' },
      { key: 'IN_ESCROW', label: 'Escrow' },
      { key: 'RELEASED', label: 'Terminé' },
    ] as const;
    const index = steps.findIndex(s => s.key === status);
    const activeIdx = index === -1 ? 0 : index;
    return (
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${i <= activeIdx ? 'bg-opnskin-primary' : 'bg-opnskin-bg-secondary border border-opnskin-bg-secondary'}`} />
            <span className={`text-xs ${i <= activeIdx ? 'text-opnskin-text-primary' : 'text-opnskin-text-secondary'}`}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={`w-8 h-[1px] ${i < activeIdx ? 'bg-opnskin-primary' : 'bg-opnskin-bg-secondary'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getInstructions = (transaction: any) => {
    if (transaction.isBuyer) {
      if (transaction.status === 'PENDING') {
        return <div className="text-yellow-400 text-xs mt-2">En attente d’envoi du skin par le vendeur. Vous recevrez une notification dès que le skin sera détecté.</div>;
      }
      if (transaction.status === 'IN_ESCROW') {
        return <div className="text-blue-400 text-xs mt-2">Le skin a été détecté. Les fonds sont en escrow en attente de libération.</div>;
      }
      if (transaction.status === 'RELEASED') {
        return <div className="text-green-400 text-xs mt-2">Transaction terminée. L’argent a été libéré au vendeur.</div>;
      }
    } else if (transaction.isSeller) {
      if (transaction.status === 'PENDING') {
        if (transaction.offer && transaction.offer.buyer && transaction.offer.buyer.tradeUrl) {
          return <div className="text-blue-400 text-xs mt-2">Vous devez envoyer le skin à l’acheteur via Steam. Cliquez sur « Lancer l’échange Steam » pour ouvrir son tradelink. L’argent sera libéré automatiquement dès que le skin sera détecté dans l’inventaire de l’acheteur.</div>;
        } else {
          return <div className="text-yellow-400 text-xs mt-2">L’acheteur n’a pas encore renseigné son tradelink Steam. Attendez qu’il le fasse pour pouvoir envoyer le skin.</div>;
        }
      }
      if (transaction.status === 'IN_ESCROW') {
        return <div className="text-blue-400 text-xs mt-2">Le skin a été détecté chez l’acheteur. Les fonds seront libérés sous peu.</div>;
      }
      if (transaction.status === 'RELEASED') {
        return <div className="text-green-400 text-xs mt-2">Transaction terminée. Les fonds ont été libérés.</div>;
      }
    }
    return null;
  };

  const filterTx = {
    all: (tx: any) => true,
    purchases: (tx: any) => tx.isBuyer,
    sales: (tx: any) => tx.isSeller,
    pending: (tx: any) => tx.status === 'PENDING' || tx.status === 'IN_ESCROW',
  };

  const renderTxList = (tab: keyof typeof filterTx) => {
    const filtered = transactions.filter(filterTx[tab]);
    if (loading) {
      return <div className="flex items-center justify-center py-12"><History className="animate-spin h-8 w-8 text-opnskin-primary" /></div>;
    }
    if (filtered.length === 0) {
      return (
          <div className="terminal-bg rounded-lg p-4 md:p-8 flex flex-col items-center justify-center text-center">
          <History className="h-12 w-12 md:h-16 md:w-16 text-opnskin-text-secondary mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 font-rajdhani">Aucune transaction</h2>
          <p className="text-opnskin-text-secondary mb-4 md:mb-6 max-w-md text-base md:text-lg">Tu n'as pas de transactions dans cette catégorie.</p>
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
          <Card key={tx.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-opnskin-text-primary">{tx.offer?.itemName || tx.offer?.itemId}</h3>
                    {getStatusBadge(tx.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-opnskin-text-secondary">
                    <div>
                      <span className="font-semibold">Prix:</span> {formatPrice(tx.offer?.price ?? 0, currency, cryptoRates)}
                    </div>
                    <div>
                      <span className="font-semibold">Date:</span> {new Date(tx.startedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Rôle:</span> {tx.isBuyer ? 'Acheteur' : 'Vendeur'}
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      {renderTimeline(tx.status)}
                    </div>
                    {tx.isSeller && tx.buyer?.name && (
                      <div>
                        <span className="font-semibold">Acheteur:</span> {tx.buyer.name}
                      </div>
                    )}
                    {tx.isBuyer && tx.offer?.sellerId && (
                      <div>
                        <span className="font-semibold">Vendeur:</span> {tx.offer.sellerId}
                      </div>
                    )}
                  </div>
                  {getInstructions(tx)}
                  {/* Bouton tradelink côté vendeur */}
                  {tx.isSeller && tx.buyer?.tradeUrl && (
                    <a
                      href={tx.buyer.tradeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-opnskin mt-2 inline-block"
                    >
                      Lancer l’échange Steam
                    </a>
                  )}
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
            <p className="text-opnskin-text-secondary text-base md:text-lg">{t('history.subtitle')}</p>
          </div>
          {/* Bouton Rafraîchir */}
          <Button onClick={fetchTransactions} className="ml-2 bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 dark:bg-opnskin-blue dark:text-white dark:border-transparent dark:hover:bg-opnskin-blue/80">
            Rafraîchir
          </Button>
        </div>
        <Tabs defaultValue="all">
          <TabsList className="bg-opnskin-bg-card/60 border border-opnskin-bg-secondary flex flex-wrap md:flex-nowrap">
            <TabsTrigger value="all" className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue">{t('history.tab_all')}</TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue">{t('history.tab_purchases')}</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue">{t('history.tab_sales')}</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-opnskin-blue/20 data-[state=active]:text-opnskin-blue">{t('history.tab_pending')}</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 md:mt-6">{renderTxList('all')}</TabsContent>
          <TabsContent value="purchases" className="mt-4 md:mt-6">{renderTxList('purchases')}</TabsContent>
          <TabsContent value="sales" className="mt-4 md:mt-6">{renderTxList('sales')}</TabsContent>
          <TabsContent value="pending" className="mt-4 md:mt-6">{renderTxList('pending')}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
