"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { useFloat } from "@/components/FloatProvider";

const skins = [
  {
    name: "AK-47 | Fire Serpent (Factory New)",
    price: 1899.99,
    image: "/ak47-fire-serpent.png",
  },
  {
    name: "AK-47 | Neon Rider (Minimal Wear)",
    price: 129.99,
    image: "/ak47-neon-rider.png",
  },
  {
    name: "M4A4 | Howl (Field-Tested)",
    price: 1299.99,
    image: "/m4a4-howl.png",
  },
  {
    name: "AWP | Asiimov (Battle-Scarred)",
    price: 89.99,
    image: "/awp-asiimov.png",
  },
];

export default function SkinCarousel() {
  const carouselRef = useRef<any>(null);
  const currency = useCurrencyStore((state) => state.currency);
  const [selectedFloatIdx, setSelectedFloatIdx] = useState<number | null>(null);

  // Défilement automatique
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current && carouselRef.current.api) {
        carouselRef.current.api.scrollNext();
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Carousel ref={carouselRef} className="w-full max-w-xl mx-auto">
      <CarouselContent>
        {skins.map((skin, idx) => {
          // Simuler un assetId unique par skin pour l'exemple
          const assetId = `skin-${idx}`;
          // Toujours appeler le hook, mais gérer l'affichage conditionnellement
          const floatState = useFloat(assetId);
          
          return (
            <CarouselItem key={idx} className="p-2">
              <Card className="group overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="aspect-square bg-gradient-to-br from-opnskin-primary/10 to-opnskin-bg-secondary/30 flex items-center justify-center relative">
                  <img
                    src={skin.image}
                    alt={skin.name}
                    className="w-40 h-40 object-contain mx-auto transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-4 flex flex-col items-center">
                  <h3 className="font-bold text-lg text-center mb-1 truncate w-full" title={skin.name}>{skin.name}</h3>
                  {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                  <span className="font-mono text-opnskin-accent font-bold text-xl mb-2">{formatPrice(skin.price, currency)}</span>
                  {selectedFloatIdx === idx ? (
                    floatState.isLoading ? (
                      <span className="text-opnskin-primary animate-pulse mt-2">Chargement du float…</span>
                    ) : floatState.isError ? (
                      <span className="text-red-500 mt-2">Erreur : {floatState.errorMsg || 'Impossible de récupérer le float'}</span>
                    ) : floatState.float !== null ? (
                      <span className="text-opnskin-accent font-mono mt-2">Float : {floatState.float}</span>
                    ) : (
                      <span className="text-opnskin-text-secondary mt-2">Aucun float disponible</span>
                    )
                  ) : (
                    <Button size="sm" className="btn-opnskin-secondary mt-2" onClick={() => setSelectedFloatIdx(idx)}>
                      Voir le float
                    </Button>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-between items-center mt-2 px-4">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  );
} 