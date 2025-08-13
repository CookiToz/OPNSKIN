"use client";

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
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { useCryptoRatesStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/UserProvider';
import { useSearchParams, useRouter } from 'next/navigation';

function formatDateTime(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div />}> 
      <WalletPageContent />
    </Suspense>
  );
}

function WalletPageContent() {
  const { t } = useTranslation('common');
  const currency = useCurrencyStore((state) => state.currency);
  const cryptoRates = useCryptoRatesStore();
  const rates = cryptoRates as unknown as Record<string, number>;
  const { toast } = useToast();
  const { user, refetch } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [stripeAccount, setStripeAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const isLoggedIn = !!user?.id;

  const deposits = useMemo(() => stripeAccount?.deposits || [], [stripeAccount]);
  const withdrawals = useMemo(() => stripeAccount?.withdrawals || [], [stripeAccount]);

  // Charger le statut du compte Stripe
  useEffect(() => {
    loadStripeAccount();
    const amt = searchParams.get('amount');
    if (amt) setDepositAmount(amt);
  }, []);

  // Rafraîchir le solde après retour Stripe (success=deposit)
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    if (success === 'deposit' && sessionId) {
      const timer = setTimeout(async () => {
        await refetch();
        await loadStripeAccount();
        toast({ title: 'Dépôt confirmé', description: 'Votre solde a été mis à jour.' });
      }, 1200);
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('session_id');
      router.replace(url.pathname + url.search);
      return () => clearTimeout(timer);
    }
  }, [searchParams, refetch, router, toast]);

  const loadStripeAccount = async () => {
    try {
      const response = await fetch('/api/stripe/account/status');
      const data = await response.json();
      if (response.ok) setStripeAccount(data);
    } catch (error) {
      console.error('Error loading Stripe account:', error);
    }
  };

  const requireAuth = () => {
    if (!isLoggedIn) {
      toast({ title: 'Connexion requise', description: 'Connecte-toi pour déposer ou retirer des fonds.', variant: 'destructive' });
      router.push('/login');
      return false;
    }
    return true;
  };

  const createStripeAccount = async () => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/create-account', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Compte Stripe créé', description: 'Votre compte Stripe a été créé avec succès.' });
        await loadStripeAccount();
        return true;
      } else {
        // Si l'utilisateur a déjà un compte, basculer l'UI en mode validation
        if ((data?.error || '').toLowerCase().includes('already has a stripe account')) {
          setStripeAccount((prev: any) => ({ ...(prev || {}), hasAccount: true }));
          toast({ title: 'Compte Stripe détecté', description: 'Complétez la configuration si nécessaire.' });
          return true;
        }
        toast({ title: 'Erreur', description: data.error || 'Erreur lors de la création du compte', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la création du compte Stripe', variant: 'destructive' });
      return false;
    } finally { setLoading(false); }
  };

  const ensureStripeAccount = async () => {
    if (stripeAccount?.hasAccount) return true;
    const ok = await createStripeAccount();
    return ok;
  };

  const createAccountLink = async () => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/create-account-link', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast({ title: 'Erreur', description: data.error || 'Impossible de générer le lien Stripe', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de générer le lien Stripe', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createDeposit = async () => {
    if (!requireAuth()) return;
    if (!depositAmount || parseFloat(depositAmount) < 5) {
      toast({ title: 'Montant invalide', description: 'Le montant minimum est de 5€', variant: 'destructive' });
      return;
    }

    // Créer automatiquement le compte Stripe si nécessaire (pour future compat)
    await ensureStripeAccount();

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/deposit/create-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(parseFloat(depositAmount) * 100) }),
      });
      const data = await response.json();
      if (response.ok) {
        window.open(data.url, '_blank');
        setDepositAmount('');
      } else {
        toast({ title: 'Erreur', description: data.error || 'Erreur lors de la création du dépôt', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la création du dépôt', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const createWithdrawal = async () => {
    if (!requireAuth()) return;
    if (!withdrawalAmount || parseFloat(withdrawalAmount) < 5) {
      toast({ title: 'Montant invalide', description: 'Le montant minimum est de 5€', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/withdrawal/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(parseFloat(withdrawalAmount) * 100) }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Retrait créé', description: 'Votre retrait a été initié avec succès.' });
        setWithdrawalAmount('');
        await loadStripeAccount();
        await refetch();
      } else {
        toast({ title: 'Erreur', description: data.error || 'Erreur lors de la création du retrait', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la création du retrait', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // Méthodes de paiement (fiat/crypto)
  const fiatMethods = [
    { icon: <CreditCard className="h-6 w-6 text-opnskin-blue" />, label: 'Carte bancaire (Stripe)', desc: 'Visa, Mastercard, AMEX' },
    { icon: <Landmark className="h-6 w-6 text-opnskin-green" />, label: 'Virement bancaire', desc: 'Bientôt disponible' },
  ];
  const cryptoMethods = [
    { icon: <Bitcoin className="h-6 w-6" style={{ color: '#F7931A' }} />, label: 'Wallet crypto', desc: 'Bientôt disponible' },
  ];

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-2 py-3 md:py-4">
        <div className="container px-2 py-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3 md:mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-rajdhani">{t('wallet.title')}</h1>
              <p className="text-opnskin-text-secondary text-base md:text-lg">{t('wallet.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3 md:gap-4">
            {/* Carte solde + actions */}
            <div>
              <Card className="rounded-2xl shadow-md bg-opnskin-bg-card/80 border-opnskin-bg-secondary mb-3 md:mb-4">
                <CardContent className="p-4 md:p-6 flex flex-col gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-opnskin-green/20 flex items-center justify-center">
                      <Wallet className="h-8 w-8 md:h-10 md:w-10 text-opnskin-green" />
                    </div>
                    <div>
                      <div className="text-opnskin-text-secondary text-sm md:text-base mb-1">{t('wallet.balance_available')}</div>
                      <div className="flex items-center gap-2">
                         {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-6 h-6 md:w-7 md:h-7 mr-1 align-middle" />}
                         <span className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-text-primary tracking-tight">
                          {typeof rates[currency] === 'number' ? formatPrice(user?.walletBalance ?? 0, currency, rates as any) : <span>...</span>}
                        </span>
                        
                      </div>
                    </div>
                  </div>

                   {!isLoggedIn && (
                    <div className="p-3 bg-opnskin-blue/10 border border-opnskin-blue/20 rounded-lg text-sm text-opnskin-text-secondary">
                      Connecte-toi pour déposer ou retirer des fonds.
                       <Button className="ml-2 h-8 px-3 bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 dark:bg-opnskin-blue dark:text-white dark:hover:bg-opnskin-blue/80" onClick={() => router.push('/login')}>Se connecter</Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        min={5}
                        step={1}
                        placeholder="Montant (min 5€)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                       className="flex-1 bg-opnskin-bg-card border border-opnskin-bg-secondary rounded px-3 py-2 text-sm text-opnskin-text-primary placeholder:text-opnskin-text-secondary"
                      />
                      <Button className="bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 text-base md:text-lg py-4 md:py-5 transition-all dark:bg-opnskin-green dark:text-white dark:hover:bg-opnskin-green/80" size="lg" onClick={createDeposit} disabled={loading || !isLoggedIn}>
                        <PlusCircle className="mr-2 h-5 w-5" /> {t('wallet.add_funds')}
                    </Button>
                      <span className="ml-2 hidden sm:inline text-[#635BFF] font-semibold">Stripe</span>
                    </div>
                    <Button className="flex-1 bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 text-base md:text-lg py-4 md:py-5 transition-all dark:bg-opnskin-blue/90 dark:text-white dark:hover:bg-opnskin-blue" size="lg" disabled>
                      <Wallet className="mr-2 h-5 w-5" /> {t('wallet.connect_crypto_wallet')}
                    </Button>
                  </div>

                  {/* Section Stripe Connect */}
                  {!stripeAccount?.hasAccount ? (
                     <div className="mt-2 p-3 bg-opnskin-blue/10 border border-opnskin-blue/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-opnskin-blue" />
                        <span className="text-sm font-semibold text-opnskin-blue">Configuration requise</span>
                      </div>
                       <p className="text-xs text-opnskin-text-secondary mb-3">Pour retirer vos fonds, vous devez configurer votre compte Stripe.</p>
                       <Button className="w-full bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 text-sm py-2 dark:bg-opnskin-primary dark:text-white dark:hover:bg-opnskin-primary/90" onClick={createStripeAccount} disabled={loading || !isLoggedIn}>
                        {loading ? 'Création...' : 'Créer mon compte Stripe'}
                  </Button>
                    </div>
                  ) : !stripeAccount?.account?.payoutsEnabled ? (
                    <div className="mt-2 p-3 bg-opnskin-violet/10 border border-opnskin-violet/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-opnskin-violet" />
                        <span className="text-sm font-semibold text-opnskin-violet">Compte en cours de validation</span>
                      </div>
                       <p className="text-xs text-opnskin-text-secondary mb-3">Votre compte Stripe doit être validé pour activer les retraits.</p>
                       <Button className="w-full bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 text-sm py-2 dark:bg-opnskin-primary dark:text-white dark:hover:bg-opnskin-primary/90" onClick={createAccountLink} disabled={loading || !isLoggedIn}>
                        {loading ? 'Chargement...' : 'Compléter la configuration'}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-opnskin-green/10 border border-opnskin-green/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-opnskin-green" />
                        <span className="text-sm font-semibold text-opnskin-green">Compte activé</span>
                      </div>
                       <p className="text-xs text-opnskin-text-secondary mb-3">Votre compte Stripe est prêt pour les retraits.</p>
                      <div className="flex gap-2">
                       <input type="number" placeholder="Montant (min 5€)" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} className="flex-1 bg-opnskin-bg-card border border-opnskin-bg-secondary rounded px-3 py-2 text-sm text-opnskin-text-primary placeholder:text-opnskin-text-secondary" />
                         <Button className="bg-white text-opnskin-text-primary border border-opnskin-bg-secondary hover:bg-opnskin-bg-secondary/40 text-sm px-4 dark:bg-opnskin-green dark:text-white dark:hover:bg-opnskin-green/80" onClick={createWithdrawal} disabled={loading || !withdrawalAmount || !isLoggedIn}>
                          {loading ? '...' : 'Retirer'}
                        </Button>
                    </div>
                    </div>
                  )}
                  </CardContent>
                </Card>

              {/* Historique Dépôts / Retraits */}
              <Card className="rounded-xl bg-opnskin-bg-card/60 border-opnskin-bg-secondary">
                <CardContent className="p-3 md:p-4">
                  <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 font-rajdhani">Historique récent</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h3 className="font-rajdhani font-bold mb-2">Dépôts</h3>
                      <div className="space-y-2">
                         {deposits.length === 0 && <div className="text-opnskin-text-secondary text-sm">Aucun dépôt récent</div>}
                        {deposits.map((d: any) => (
                          <div key={d.id} className="flex items-center justify-between rounded-lg border border-opnskin-bg-secondary px-3 py-2">
                            <div className="text-sm text-opnskin-text-primary">
                              <div className="font-semibold">{(d.amount/100).toFixed(2)} €</div>
                              <div className="text-opnskin-text-secondary text-xs">{formatDateTime(d.createdAt)}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${d.status==='succeeded'?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-300'}`}>{d.status}</span>
                          </div>
                        ))}
                    </div>
                    </div>
                    <div>
                      <h3 className="font-rajdhani font-bold mb-2">Retraits</h3>
                      <div className="space-y-2">
                         {withdrawals.length === 0 && <div className="text-opnskin-text-secondary text-sm">Aucun retrait récent</div>}
                        {withdrawals.map((w: any) => (
                          <div key={w.id} className="flex items-center justify-between rounded-lg border border-opnskin-bg-secondary px-3 py-2">
                            <div className="text-sm text-opnskin-text-primary">
                              <div className="font-semibold">{(w.amount/100).toFixed(2)} €</div>
                              <div className="text-opnskin-text-secondary text-xs">{formatDateTime(w.createdAt)}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${w.status==='succeeded'?'bg-green-500/20 text-green-400': w.status==='pending' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{w.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Méthodes de paiement (colonne droite) */}
            <div>
              <Card className="rounded-2xl bg-opnskin-bg-card/80 border-opnskin-bg-secondary shadow-md mb-3 md:mb-4">
                <CardContent className="p-3 md:p-4">
                  <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 font-rajdhani">{t('wallet.payment_methods')}</h2>
                  <div className="mb-1 text-opnskin-text-secondary font-semibold uppercase text-xs tracking-wider">Fiat</div>
                  <div className="flex flex-col gap-2 mb-2">
                    {fiatMethods.map((m, i) => (
                      <Card key={i} className="rounded-xl bg-opnskin-bg-card/60 border-opnskin-bg-secondary flex items-center gap-2 p-2 md:p-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          {m.icon}
                          <div>
                            <div className="font-rajdhani font-bold text-opnskin-text-primary text-sm md:text-base">
                              {m.label.includes('Stripe') ? (
                                <>
                                  Carte bancaire (<span className="text-[#635BFF] font-semibold">Stripe</span>)
                                </>
                              ) : (
                                m.label
                              )}
                            </div>
                            <div className="text-opnskin-text-secondary text-xs">{m.desc}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="mb-1 text-opnskin-text-secondary font-semibold uppercase text-xs tracking-wider">Crypto</div>
                  <div className="flex flex-col gap-2">
                    {cryptoMethods.map((m, i) => (
                      <Card key={i} className="rounded-xl bg-opnskin-bg-card/60 border-opnskin-bg-secondary flex items-center gap-2 p-2 md:p-3">
                        <div className="flex items-center gap-2 md:gap-3">{m.icon}<div><div className="font-rajdhani font-bold text-opnskin-text-primary text-sm md:text-base">{m.label}</div><div className="text-opnskin-text-secondary text-xs">{m.desc}</div></div></div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
