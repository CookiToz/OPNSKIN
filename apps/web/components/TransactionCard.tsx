"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionStepper, TransactionStatus } from './TransactionStepper';
import { formatPrice } from '@/lib/utils';
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';

interface TransactionCardProps {
  transaction: {
    id: string;
    status: TransactionStatus;
    offer: {
      itemName?: string;
      itemId?: string;
      itemImage?: string;
      price: number;
      sellerId?: string;
    };
    buyer?: {
      name?: string;
      tradeUrl?: string;
    };
    seller?: {
      name?: string;
    };
    isBuyer: boolean;
    isSeller: boolean;
    startedAt: string;
    buyerId?: string;
    sellerId?: string;
  };
  currency: string;
  cryptoRates: any;
}

export function TransactionCard({ transaction, currency, cryptoRates }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInstructions = () => {
    if (transaction.isBuyer) {
      switch (transaction.status) {
        case 'PENDING':
          return {
            text: 'En attente d\'envoi du skin par le vendeur. Vous recevrez une notification dès que le skin sera détecté.',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
          };
        case 'IN_ESCROW':
          return {
            text: 'Le skin a été détecté. Les fonds sont en escrow en attente de libération.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
          };
        case 'RELEASED':
          return {
            text: 'Transaction terminée. L\'argent a été libéré au vendeur.',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          };
        default:
          return null;
      }
    } else if (transaction.isSeller) {
      switch (transaction.status) {
        case 'PENDING':
          if (transaction.buyer?.tradeUrl) {
            return {
              text: 'Vous devez envoyer le skin à l\'acheteur via Steam. Cliquez sur « Lancer l\'échange Steam » pour ouvrir son tradelink.',
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10',
              action: 'trade',
            };
          } else {
            return {
              text: 'L\'acheteur n\'a pas encore renseigné son tradelink Steam. Attendez qu\'il le fasse pour pouvoir envoyer le skin.',
              color: 'text-yellow-500',
              bgColor: 'bg-yellow-500/10',
            };
          }
        case 'IN_ESCROW':
          return {
            text: 'Le skin a été détecté chez l\'acheteur. Les fonds seront libérés sous peu.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
          };
        case 'RELEASED':
          return {
            text: 'Transaction terminée. Les fonds ont été libérés.',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          };
        default:
          return null;
      }
    }
    return null;
  };

  const instruction = getInstructions();

  return (
    <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary hover:border-opnskin-primary/20 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {transaction.offer.itemImage && (
                <img 
                  src={transaction.offer.itemImage} 
                  alt={transaction.offer.itemName || 'Skin'} 
                  className="w-12 h-12 rounded-lg object-cover border border-opnskin-bg-secondary"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-opnskin-text-primary truncate">
                  {transaction.offer.itemName || transaction.offer.itemId || 'Skin inconnu'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {transaction.isBuyer ? 'Acheteur' : 'Vendeur'}
                  </Badge>
                  <span className="text-sm text-opnskin-text-secondary">
                    {new Date(transaction.startedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-opnskin-accent">
                  {formatPrice(transaction.offer.price, currency, cryptoRates)}
                </span>
              </div>
            </div>

            <TransactionStepper status={transaction.status} className="mb-3" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {instruction && (
          <div className={cn(
            "p-3 rounded-lg border mb-3 transition-all duration-300",
            instruction.bgColor,
            instruction.color,
            "border-current/20"
          )}>
            <p className="text-sm">{instruction.text}</p>
            {instruction.action === 'trade' && transaction.buyer?.tradeUrl && (
              <Button
                asChild
                size="sm"
                className="mt-2 bg-current text-white hover:bg-current/80"
              >
                <a
                  href={transaction.buyer.tradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Lancer l'échange Steam
                </a>
              </Button>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-opnskin-text-secondary hover:text-opnskin-text-primary transition-colors duration-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Masquer les détails
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Voir plus de détails
            </>
          )}
        </Button>

        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="pt-3 space-y-3 border-t border-opnskin-bg-secondary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-opnskin-text-secondary" />
                <span className="text-opnskin-text-secondary">ID Transaction:</span>
                <span className="font-mono text-opnskin-text-primary">{transaction.id}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-opnskin-text-secondary" />
                <span className="text-opnskin-text-secondary">Créée le:</span>
                <span className="text-opnskin-text-primary">
                  {new Date(transaction.startedAt).toLocaleString('fr-FR')}
                </span>
              </div>

              {transaction.isBuyer && transaction.seller?.name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-opnskin-text-secondary" />
                  <span className="text-opnskin-text-secondary">Vendeur:</span>
                  <span className="text-opnskin-text-primary">{transaction.seller.name}</span>
                </div>
              )}

              {transaction.isSeller && transaction.buyer?.name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-opnskin-text-secondary" />
                  <span className="text-opnskin-text-secondary">Acheteur:</span>
                  <span className="text-opnskin-text-primary">{transaction.buyer.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
