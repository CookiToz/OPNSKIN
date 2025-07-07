"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';
import { RepeatType } from "framer-motion"

const SKINS = [
  { name: "AK-47 | Asiimov", price: 249.99, image: "/placeholder.svg?height=120&width=120&text=AK-47" },
  { name: "M4A4 | Howl", price: 1299.99, image: "/placeholder.svg?height=120&width=120&text=M4A4" },
  { name: "AWP | Dragon Lore", price: 1999.99, image: "/placeholder.svg?height=120&width=120&text=AWP" },
  { name: "Karambit | Fade", price: 1599.99, image: "/placeholder.svg?height=120&width=120&text=Karambit" },
  { name: "Butterfly | Doppler", price: 899.99, image: "/placeholder.svg?height=120&width=120&text=Butterfly" },
  { name: "Desert Eagle | Blaze", price: 399.99, image: "/placeholder.svg?height=120&width=120&text=Deagle" },
  { name: "Glock-18 | Fade", price: 299.99, image: "/placeholder.svg?height=120&width=120&text=Glock" },
  { name: "USP-S | Kill Confirmed", price: 199.99, image: "/placeholder.svg?height=120&width=120&text=USP-S" },
];

export function MarketplaceAnimation() {
  const currency = useCurrencyStore((state) => state.currency);

  // Animation parameters
  const floatTransition = {
    y: {
      duration: 3.5,
      repeat: Infinity,
      repeatType: "reverse" as RepeatType,
      ease: "easeInOut",
    },
    opacity: {
      duration: 0.6,
    },
  };

  // Optionally, you can randomize the floating amplitude per skin
  const getFloatY = (i: number) => [0, 12 + (i % 3) * 6, 0];

  // Convert cryptoRates to a Record<string, CryptoRate> for formatPrice
  const cryptoRatesRecord = Object.fromEntries(Object.entries(cryptoRates).filter(([k]) => k !== 'setCryptoRates')) as Record<string, any>;

  return (
    <div
      className="relative w-full h-[340px] md:h-[400px] flex flex-wrap items-center justify-center overflow-visible bg-transparent"
    >
      <AnimatePresence>
        {SKINS.map((skin, i) => (
          <motion.div
            key={skin.name}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: getFloatY(i) }}
            exit={{ opacity: 0 }}
            transition={floatTransition}
            className="absolute shadow-2xl rounded-xl p-2 flex flex-col items-center neon-glow cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-20"
            style={{
              left: `${12 + 76 * (i % 4)}px`,
              top: `${30 + 80 * Math.floor(i / 4)}px`,
              zIndex: 10 + i,
              background: 'rgba(20,20,30,0.85)',
              boxShadow: '0 0 24px 4px #00fff7, 0 0 0 2px #0ff2, 0 2px 16px #000',
            }}
          >
            <img
              src={skin.image}
              alt={skin.name}
              className="w-20 h-20 object-contain mb-2 drop-shadow-[0_0_12px_#00fff7]"
              style={{ filter: 'drop-shadow(0 0 8px #00fff7)' }}
            />
            {cryptoIcons[currency as keyof typeof cryptoIcons] && <img src={cryptoIcons[currency as keyof typeof cryptoIcons]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
            <span className="text-xs text-opnskin-accent font-mono font-bold mb-1 drop-shadow-[0_0_4px_#00fff7]">
              {formatPrice(skin.price, currency, cryptoRatesRecord)}
            </span>
            <span className="text-[13px] text-white font-bold text-center whitespace-nowrap drop-shadow-[0_0_4px_#00fff7]">
              {skin.name}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Glow ambiance */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,247,0.08) 0%, transparent 80%)',
        zIndex: 1,
      }} />
    </div>
  );
}

// Ajoute dans globals.css :
// .neon-glow { box-shadow: 0 0 16px #00fff7, 0 0 2px #0ff2; }
