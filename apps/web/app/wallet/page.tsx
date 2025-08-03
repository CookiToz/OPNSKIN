'use client';

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  PlusCircle,
  Wallet,
  CreditCard,
  Clock,
  Shield,
  Coins,
  Headphones,
  ChevronRight,
  Bitcoin,
  Landmark,
  ArrowDownCircle,
} from "lucide-react"
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

export default function WalletPage() {
  const { t } = useTranslation('common');
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const { toast } = useToast();

  // Méthodes de paiement (fiat/crypto)
  const fiatMethods = [
    {
      icon: <CreditCard className="h-6 w-6 text-kalpix-blue" />, label: t('wallet.card_payment', 'Carte bancaire'), desc: 'Visa, Mastercard, AMEX',
    },
    {
      icon: <Landmark className="h-6 w-6 text-kalpix-green" />, label: t('wallet.bank_transfer', 'Virement bancaire'), desc: t('wallet.bank_transfer_desc', 'Dépôt direct depuis votre banque'),
    },
  ];
  const cryptoMethods = [
    {
      icon: <Bitcoin className="h-6 w-6 text-kalpix-violet" />, label: t('wallet.crypto_wallet', 'Wallet crypto'), desc: t('wallet.crypto_supported', 'ETH, USDT, etc.'),
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-2 py-3 md:py-4">
        <div className="container px-2 py-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3 md:mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">{t('wallet.title')}</h1>
              <p className="text-white/70 text-base md:text-lg">{t('wallet.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 md:gap-4">
            {/* Carte principale solde + actions */}
            <div>
              <Card className="rounded-2xl shadow-md bg-black/60 border-white/5 mb-3 md:mb-4">
                <CardContent className="p-4 md:p-6 flex flex-col gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-kalpix-green/20 flex items-center justify-center">
                      <Wallet className="h-8 w-8 md:h-10 md:w-10 text-kalpix-green" />
                    </div>
                    <div>
                      <div className="text-white/80 text-sm md:text-base mb-1">{t('wallet.balance_available')}</div>
                      <div className="flex items-center gap-2">
                        {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-6 h-6 md:w-7 md:h-7 mr-1 align-middle" />}
                        <span className="text-2xl md:text-3xl font-bold font-rajdhani text-white tracking-tight">
                          {cryptoRates[currency] ? formatPrice(0, currency, cryptoRates) : <span>...</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <Button className="flex-1 bg-kalpix-green hover:bg-kalpix-green/80 text-base md:text-lg py-4 md:py-5 transition-all" size="lg">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      {t('wallet.add_funds')}
                    </Button>
                    <Button
                      className="flex-1 bg-kalpix-blue/90 hover:bg-kalpix-blue text-base md:text-lg py-4 md:py-5 transition-all"
                      size="lg"
                    >
                      <Wallet className="mr-2 h-5 w-5" />
                      {t('wallet.connect_crypto_wallet')}
                    </Button>
                  </div>
                  <Button
                    className="w-full mt-2 bg-muted/10 text-base md:text-lg py-4 md:py-5 transition-all flex items-center justify-center gap-2 border border-kalpix-violet/40 text-kalpix-violet hover:bg-kalpix-violet/10"
                    size="lg"
                    disabled
                    onClick={() => toast({
                      title: t('wallet.withdraw_coming', 'Fonctionnalité à venir'),
                      description: t('wallet.withdraw_coming_desc', 'Retraits vers OPNDEX ou Stripe bientôt disponibles.'),
                    })}
                  >
                    <ArrowDownCircle className="mr-2 h-5 w-5" />
                    {t('wallet.withdraw_funds', 'Retirer mes fonds')}
                  </Button>
                </CardContent>
              </Card>

              {/* Avantages / sécurité / multi-devise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                <Card className="rounded-xl bg-black/40 border-white/5 transition-all">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-kalpix-blue/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-kalpix-blue" />
                    </div>
                    <div>
                      <h3 className="font-rajdhani font-bold text-sm md:text-base">{t('wallet.instant_deposits')}</h3>
                      <p className="text-white/70 text-xs md:text-sm">{t('wallet.instant_funds')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl bg-black/40 border-white/5 transition-all">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-kalpix-green/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-kalpix-green" />
                    </div>
                    <div>
                      <h3 className="font-rajdhani font-bold text-sm md:text-base">{t('wallet.secure_transactions')}</h3>
                      <p className="text-white/70 text-xs md:text-sm">{t('wallet.encrypted_payments')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl bg-black/40 border-white/5 transition-all">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-kalpix-violet/20 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-kalpix-violet" />
                    </div>
                    <div>
                      <h3 className="font-rajdhani font-bold text-sm md:text-base">{t('wallet.multi_currencies')}</h3>
                      <p className="text-white/70 text-xs md:text-sm">{t('wallet.fiat_crypto_supported')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl bg-black/40 border-white/5 transition-all">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-kalpix-blue/20 flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-kalpix-blue" />
                    </div>
                    <div>
                      <h3 className="font-rajdhani font-bold text-sm md:text-base">{t('wallet.support_247')}</h3>
                      <p className="text-white/70 text-xs md:text-sm">{t('wallet.help_when_needed')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Historique */}
              <Card className="rounded-xl bg-black/40 border-white/5">
                <CardContent className="p-3 md:p-4">
                  <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 font-rajdhani">{t('wallet.recent_transactions')}</h2>
                  <div className="terminal-bg rounded-lg p-4 md:p-6 flex flex-col items-center justify-center text-center">
                    <Clock className="h-10 w-10 md:h-12 md:w-12 text-white/30 mb-2 md:mb-3" />
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 font-rajdhani">{t('wallet.no_history')}</h3>
                    <p className="text-white/70 mb-0 text-xs md:text-sm">
                      {t('wallet.no_history_desc')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Méthodes de paiement */}
            <div>
              <Card className="rounded-2xl bg-black/60 border-white/5 shadow-md mb-3 md:mb-4">
                <CardContent className="p-3 md:p-4">
                  <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 font-rajdhani">{t('wallet.payment_methods')}</h2>
                  <div className="mb-1 text-white/60 font-semibold uppercase text-xs tracking-wider">Fiat</div>
                  <div className="flex flex-col gap-2 mb-2">
                    {fiatMethods.map((m, i) => (
                      <Card key={i} className="rounded-xl bg-black/30 border-white/10 flex items-center gap-2 p-2 md:p-3 hover:bg-muted/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 md:gap-3">
                          {m.icon}
                          <div>
                            <div className="font-rajdhani font-bold text-white text-sm md:text-base">{m.label}</div>
                            <div className="text-white/60 text-xs">{m.desc}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="mb-1 text-white/60 font-semibold uppercase text-xs tracking-wider">Crypto</div>
                  <div className="flex flex-col gap-2">
                    {cryptoMethods.map((m, i) => (
                      <Card key={i} className="rounded-xl bg-black/30 border-white/10 flex items-center gap-2 p-2 md:p-3 hover:bg-muted/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 md:gap-3">
                          {m.icon}
                          <div>
                            <div className="font-rajdhani font-bold text-white text-sm md:text-base">{m.label}</div>
                            <div className="text-white/60 text-xs">{m.desc}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Tabs conservés pour l'historique si besoin */}
              <Tabs defaultValue="history">
                <TabsList className="w-full bg-black/40 border border-white/10 mt-2">
                  <TabsTrigger
                    value="history"
                    className="flex-1 data-[state=active]:bg-kalpix-blue/20 data-[state=active]:text-kalpix-blue"
                  >
                    {t('wallet.purchase_history')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="history" className="mt-4">
                  <div className="terminal-bg rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Clock className="h-12 w-12 text-white/30 mb-3" />
                    <h3 className="text-lg font-bold mb-2 font-rajdhani">Aucun historique d'achat</h3>
                    <p className="text-white/70 mb-0">
                      Ton historique d'achat apparaîtra ici une fois que tu auras effectué des achats.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
