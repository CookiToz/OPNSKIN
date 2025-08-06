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
import { PageLoading, SectionLoading } from '@/components/ui/loading';
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

  // Afficher le contenu immédiatement, sans loader
  if (!ready) return null;
  
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
            <Image
              src={skinImages[bgIndex]}
              alt={`Skin gaming ${bgIndex + 1} - OPNSKIN Marketplace`}
              width={420}
              height={240}
              className="skin-bg-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'blur(2px) brightness(0.3)',
                transition: 'opacity 1s ease-in-out',
              }}
              priority
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="mb-4 bg-opnskin-accent/20 text-opnskin-accent border-opnskin-accent/30">
            {t('home.hero_badge')}
          </Badge>

          {/* Titre principal H1 pour SEO */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-opnskin-text-primary">
            {t('home.hero_title_1')} <span className="neon-text">{t('home.hero_title_2')}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-opnskin-text-secondary mb-8 max-w-2xl mx-auto">
            {t('home.hero_description')}
          </p>

          {/* Bouton CTA */}
          <Link href="/marketplace">
            <Button size="lg" className="bg-opnskin-accent hover:bg-opnskin-accent/90 text-white px-8 py-3 text-lg">
              {t('home.hero_cta')} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* SECTION POURQUOI CHOISIR OPNSKIN */}
      <section className="py-16 md:py-24 bg-opnskin-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-opnskin-text-primary mb-4">
              {t('home.why_title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sécurité */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary text-center p-6">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-opnskin-accent" />
              </div>
              <h3 className="text-xl font-semibold text-opnskin-text-primary mb-2">
                {t('home.why_security_title')}
              </h3>
              <p className="text-opnskin-text-secondary">
                {t('home.why_security_desc')}
              </p>
            </Card>

            {/* Rapidité */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary text-center p-6">
              <div className="flex justify-center mb-4">
                <Zap className="w-12 h-12 text-opnskin-accent" />
              </div>
              <h3 className="text-xl font-semibold text-opnskin-text-primary mb-2">
                {t('home.why_speed_title')}
              </h3>
              <p className="text-opnskin-text-secondary">
                {t('home.why_speed_desc')}
              </p>
            </Card>

            {/* Portefeuille */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary text-center p-6">
              <div className="flex justify-center mb-4">
                <Wallet className="w-12 h-12 text-opnskin-accent" />
              </div>
              <h3 className="text-xl font-semibold text-opnskin-text-primary mb-2">
                {t('home.why_wallet_title')}
              </h3>
              <p className="text-opnskin-text-secondary">
                {t('home.why_wallet_desc')}
              </p>
            </Card>

            {/* Support */}
            <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary text-center p-6">
              <div className="flex justify-center mb-4">
                <Package className="w-12 h-12 text-opnskin-accent" />
              </div>
              <h3 className="text-xl font-semibold text-opnskin-text-primary mb-2">
                {t('home.why_support_title')}
              </h3>
              <p className="text-opnskin-text-secondary">
                {t('home.why_support_desc')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION SKINS POPULAIRES */}
      <PopularSkins />

      {/* SECTION FRAIS DE TRANSACTION */}
      <section className="py-16 md:py-24 bg-opnskin-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-opnskin-text-primary mb-4">
              {t('home.fees_title')}
            </h2>
            <p className="text-lg text-opnskin-text-secondary max-w-2xl mx-auto">
              {t('home.fees_description')}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <FeeProgressionChart />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-opnskin-bg-primary border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 font-rajdhani">{t('home.footer_about')}</h3>
              <p className="text-white/70 mb-4">
                {t('home.footer_about_desc')}
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
                  <Link href="/privacy" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_privacy')}
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_terms')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-opnskin-accent">
                    {t('home.footer_mentions')}
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.openAxeptioCookies) {
                        window.openAxeptioCookies();
                      }
                    }}
                    className="text-white/70 hover:text-opnskin-accent text-left"
                  >
                    {t('home.footer_cookies')}
                  </button>
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
