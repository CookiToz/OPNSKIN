"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import Link from "next/link";

export default function Transactions() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Erreur lors du chargement des transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos transactions.",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [toast]);

  const handleConfirmTrade = async (offerId: string) => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'confirm_trade' }),
      });

      if (response.ok) {
        toast({
          title: "Transaction confirmée",
          description: "L'échange a été confirmé avec succès.",
        });
        fetchTransactions(); // Rafraîchir la liste
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible de confirmer la transaction.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation.",
        variant: "destructive",
      });
    }
  };

  const handleCancelTransaction = async (offerId: string) => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel_transaction' }),
      });

      if (response.ok) {
        toast({
          title: "Transaction annulée",
          description: "La transaction a été annulée avec succès.",
        });
        fetchTransactions(); // Rafraîchir la liste
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible d'annuler la transaction.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation.",
        variant: "destructive",
      });
    }
  };

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
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getInstructions = (transaction: any) => {
    if (transaction.isBuyer) {
      if (transaction.status === 'WAITING_TRADE') {
        return <div className="text-yellow-400 text-sm mt-2">En attente d’envoi du skin par le vendeur. Vous recevrez une notification dès que le skin sera livré.</div>;
      }
      if (transaction.status === 'DONE') {
        return <div className="text-green-400 text-sm mt-2">Transaction terminée. Le skin a été livré et l’argent a été libéré.</div>;
      }
    } else if (transaction.isSeller) {
      if (transaction.status === 'WAITING_TRADE') {
        if (transaction.offer && transaction.offer.buyer && transaction.offer.buyer.tradeUrl) {
          return <div className="text-blue-400 text-sm mt-2">Vous devez envoyer le skin à l’acheteur via Steam. Cliquez sur « Lancer l’échange Steam » pour ouvrir son tradelink. L’argent sera libéré automatiquement dès que le skin sera détecté dans l’inventaire de l’acheteur.</div>;
        } else {
          return <div className="text-yellow-400 text-sm mt-2">L’acheteur n’a pas encore renseigné son tradelink Steam. Attendez qu’il le fasse pour pouvoir envoyer le skin.</div>;
        }
      }
      if (transaction.status === 'DONE') {
        return <div className="text-green-400 text-sm mt-2">Transaction terminée. Le skin a été livré et l’argent a été libéré.</div>;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="border-opnskin-primary/30 text-opnskin-primary hover:bg-opnskin-primary/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <Package className="h-8 w-8 text-opnskin-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-text-primary">
            Mes transactions
          </h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-opnskin-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <Package className="h-16 w-16 text-opnskin-text-secondary/30" />
            <div className="text-center">
              <h2 className="text-xl font-bold font-satoshi-bold text-opnskin-text-primary mb-2">
                Aucune transaction
              </h2>
              <p className="text-opnskin-text-secondary mb-4">
                Vous n'avez pas encore effectué de transactions.
              </p>
              <Link href="/marketplace">
                <Button className="btn-opnskin">
                  Aller au marketplace
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-opnskin-text-primary">
                          {transaction.offer.itemName}
                        </h3>
                        {getStatusBadge(transaction.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-opnskin-text-secondary">
                        <div>
                          <span className="font-semibold">Prix:</span> {formatPrice(transaction.escrowAmount, currency, cryptoRates)}
                        </div>
                        <div>
                          <span className="font-semibold">Date:</span> {new Date(transaction.startedAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-semibold">Rôle:</span> {transaction.isBuyer ? 'Acheteur' : 'Vendeur'}
                        </div>
                        {transaction.isSeller && transaction.offer.transaction?.buyer && (
                          <div>
                            <span className="font-semibold">Acheteur:</span> {transaction.offer.transaction.buyer.name}
                          </div>
                        )}
                        {transaction.isBuyer && transaction.offer.seller && (
                          <div>
                            <span className="font-semibold">Vendeur:</span> {transaction.offer.seller.name}
                          </div>
                        )}
                      </div>
                      {getInstructions(transaction)}
                    </div>
                    
                    <div className="flex gap-2">
                      {transaction.status === 'WAITING_TRADE' && transaction.isSeller && (
                        <>
                          <Button 
                            onClick={() => handleConfirmTrade(transaction.offerId)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            Confirmer
                          </Button>
                          <Button 
                            onClick={() => handleCancelTransaction(transaction.offerId)}
                            variant="destructive"
                            size="sm"
                          >
                            Annuler
                          </Button>
                        </>
                      )}
                      
                      {transaction.status === 'WAITING_TRADE' && transaction.isBuyer && (
                        <div className="text-yellow-600 text-sm bg-yellow-900/20 rounded px-3 py-2">
                          En attente de confirmation du vendeur
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 