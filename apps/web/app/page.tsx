'use client';

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Shield, Zap, Wallet, Package } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from 'react';
import SteamAuthStatus from '@/components/SteamAuthStatus';
import SkinCarousel from '@/components/SkinCarousel';
import Marketplace3DGallery from '@/components/Marketplace3DGallery';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import FeeProgressionChart from '@/components/FeeProgressionChart';
import PopularSkins from '@/components/PopularSkins';
import { formatPrice } from '@/lib/utils';
import { useCurrencyStore, useCryptoRatesStore } from '@/hooks/use-currency-store';
import { cryptoIcons } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useUser } from "@/components/UserProvider";

type SteamProfile = {
  loggedIn: boolean;
  steamId?: string;
  name?: string;
  avatar?: string;
  profileUrl?: string;
};

export default function Home() {
  const { t, ready } = useTranslation('common');
  const { currency } = useCurrencyStore();
  const cryptoRates = useCryptoRatesStore();
  const { user, isLoading, isError } = useUser();
  
  // Utiliser le hook pour mettre à jour les taux crypto toutes les 30 secondes
  // useCryptoRates();

  // Hooks toujours au niveau racine
  const skinImages = [
    '/Wildlotus.png',
    '/awp-asiimov.png',
    '/ak47-neon-rider.png',
    '/m4a4-howl.png',
    '/ak47-fire-serpent.png',
    '/M4A1S_Printstream.png',
  ];
  const [bgIndex, setBgIndex] = useState(0); // Index du skin affiché
  const timeoutRef = useRef<NodeJS.Timeout|null>(null);

  // Fonction pour sélectionner le prochain skin en évitant les AK consécutifs
  const getNextSkinIndex = (currentIndex: number): number => {
    const currentSkin = skinImages[currentIndex];
    const isCurrentAK = currentSkin.includes('ak47');
    let nextIndex = (currentIndex + 1) % skinImages.length;
    let nextSkin = skinImages[nextIndex];
    if (isCurrentAK && nextSkin.includes('ak47')) {
      nextIndex = (nextIndex + 1) % skinImages.length;
    }
    return nextIndex;
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setBgIndex(getNextSkinIndex(bgIndex));
    }, 5000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [bgIndex, skinImages.length]);

  if (!ready) return null; // ou un loader si tu préfères
  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur de connexion</div>;

  return (
    <div className="relative min-h-screen">
      {/* HERO SECTION avec fond animé */}
      <section className="relative flex flex-col justify-center items-center h-[60vh] min-h-[400px] w-full overflow-hidden bg-transparent">
        {/* Fond animé, seulement sur desktop */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 hidden md:block">
          <div
            className="skin-bg-container"
            style={{
              width: 420,
              height: 240,
              aspectRatio: 1.75,
              position: 'absolute',
              left: '78%',
              top: '75%',
              transform: 'translate(-50%, -50%) scale(1.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              zIndex: 0,
              background: 'transparent',
            }}
          >
            {/* Image actuelle */}
            <img
              src={skinImages[bgIndex]}
              alt="Skin background current"
              className="animated-bg-skin"
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: 1.75,
                objectFit: 'contain',
                background: 'transparent',
                position: 'absolute',
                left: 0,
                top: 0,
              }}
              draggable="false"
            />
          </div>
        </div>
        {/* Contenu Hero */}
        <div className="relative z-10 flex flex-col items-center lg:items-start justify-center h-full w-full px-4 md:px-4">
            <Badge className="mb-4 px-4 py-1 w-fit bg-opnskin-primary/10 text-opnskin-primary border-opnskin-primary/30 text-xs md:text-base mt-6 md:mt-0">
            {t('home.hero_badge')}
            </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 font-satoshi-bold text-center lg:text-left w-full lg:w-auto leading-tight md:leading-tight">
            {t('home.hero_title_1')} <span className="neon-text">{t('home.hero_title_skins')}</span> {t('home.hero_title_2')} <span className="neon-text">{t('home.hero_title_opportunities')}</span>
          </h1>
          <p className="text-base sm:text-lg text-opnskin-text-secondary mb-6 md:mb-8 max-w-xl md:max-w-2xl text-center lg:text-left w-full lg:w-auto">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto justify-center lg:justify-start">
            <Link href="/marketplace">
              <Button size="lg" className="btn-opnskin flex items-center w-full sm:w-auto text-base md:text-lg py-3 md:py-4">
                {t('home.hero_cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="flex justify-center lg:justify-start">
              <SteamAuthStatus />
            </div>
          </div>
          {/* Animation mobile : SOUS le texte, visible uniquement sur mobile */}
          <div className="block md:hidden w-full flex justify-center mt-6">
            <div className="skin-bg-container-mobile max-w-xs w-full flex items-center justify-center">
              <img
                src={skinImages[bgIndex]}
                alt="Skin background current"
                className="animated-bg-skin"
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: 1.75,
                  objectFit: 'contain',
                  background: 'transparent',
                }}
                draggable="false"
              />
            </div>
          </div>
        </div>
        {/* Animations CSS globales */}
        <style jsx global>{`
          @keyframes levitate {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-28px); }
            100% { transform: translateY(0px); }
          }
          
          .animated-bg-skin {
            object-fit: contain;
            object-position: center;
            will-change: transform, opacity;
            animation: levitate 7s ease-in-out infinite;
            transition: opacity 0.8s ease-in-out;
          }
        `}</style>
      </section>

      <section className="py-10 md:py-16">
        <div className="container px-2 md:px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center font-satoshi-bold">
            {t('home.why_title_1')} <span className="neon-text">OPNSKIN</span> {t('home.why_title_2')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-opnskin-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-opnskin-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-satoshi-bold">{t('home.why_security_title')}</h3>
                <p className="text-opnskin-text-secondary">
                  {t('home.why_security_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-opnskin-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-opnskin-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-satoshi-bold">{t('home.why_valuation_title')}</h3>
                <p className="text-opnskin-text-secondary">
                  {t('home.why_valuation_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-opnskin-primary/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-opnskin-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-satoshi-bold">{t('home.why_fast_title')}</h3>
                <p className="text-opnskin-text-secondary">
                  {t('home.why_fast_desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary card-hover">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-opnskin-primary/20 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-opnskin-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-satoshi-bold">{t('home.why_multi_title')}</h3>
                <p className="text-opnskin-text-secondary">
                  {t('home.why_multi_desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container px-2 md:px-4">
          {/* Titre Skins populaires */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-satoshi-bold mb-4 md:mb-0">
              {t('home.popular_title_1')} <span className="neon-text">{t('home.popular_title_2')}</span>
            </h2>
          </div>
            <PopularSkins />
        </div>
      </section>

      <FeeProgressionChart />

      <section className="py-10 md:py-16 bg-gradient-to-b from-black/50 to-black">
        <div className="container px-2 md:px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="neon" className="mb-4 px-4 py-1 text-xs md:text-base">
              {t('home.community_badge')}
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 font-rajdhani">
              {t('home.community_professional_title')}
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-6 md:mb-8">
              {t('home.community_subtitle')}
            </p>
            {user?.loggedIn ? (
              <div className="inline-flex items-center gap-2 justify-center">
                <span className="font-bold text-opnskin-accent">{t('home.connected')}</span>
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#0CE49B', boxShadow: '0 0 8px #0CE49B88' }}></span>
              </div>
            ) : (
              <Button variant="secondary" size="lg" onClick={() => window.location.href = '/api/auth/steam'} className="flex items-center gap-2">
                <img
                  src="/icons8-steam-128.png"
                  alt="Steam"
                  className="w-7 h-7 object-contain"
                />
                {t('home.connect_steam_now')}
              </Button>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 bg-black border-t border-white/5">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-rajdhani">{t('home.footer_opnskin')}</h3>
              <p className="text-white/70 mb-4">
                {t('home.footer_desc')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-opnskin-accent">
                  {t('home.footer_twitter')}
                </a>
                <a href="#" className="text-white/70 hover:text-opnskin-accent">
                  {t('home.footer_discord')}
                </a>
                <a href="#" className="text-white/70 hover:text-opnskin-accent">
                  {t('home.footer_instagram')}
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 font-rajdhani">{t('home.footer_quicklinks')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/marketplace" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_marketplace')}
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_inventory')}
                  </Link>
                </li>
                <li>
                  <Link href="/listings" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_listings')}
                  </Link>
                </li>
                <li>
                  <Link href="/wallet" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_wallet')}
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_history')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 font-rajdhani">{t('home.footer_support')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_helpcenter')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_faq')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_contact')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_report')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 font-rajdhani">{t('home.footer_legal')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_terms')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_mentions')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_cookies')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
            <p>{t('home.footer_copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
