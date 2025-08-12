"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Html, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { useCurrencyStore } from '@/hooks/use-currency-store';
import { formatPrice } from '@/lib/utils';
import { cryptoIcons } from '@/lib/utils';

const SKINS = [
  {
    name: "Karambit | Fade",
    price: 1599.99,
    model: "/models/karambit.glb", // à remplacer par un vrai modèle glb
    color: "#00fff7",
  },
  {
    name: "AWP | Dragon Lore",
    price: 1999.99,
    model: "/models/awp.glb",
    color: "#ffb300",
  },
  {
    name: "Butterfly | Doppler",
    price: 899.99,
    model: "/models/butterfly.glb",
    color: "#ff00e0",
  },
  {
    name: "Desert Eagle | Blaze",
    price: 399.99,
    model: "/models/deagle.glb",
    color: "#ff5e00",
  },
];

function SkinModel({ url, color }: { url: string; color: string }) {
  // Placeholder: charge le modèle glTF/GLB
  const { scene } = useGLTF(url);
  return (
    <primitive object={scene} scale={1.2} />
  );
}

export default function Marketplace3DGallery() {
  const currency = useCurrencyStore((state) => state.currency);

  return (
    <div className="w-full h-[420px] md:h-[520px] relative rounded-xl overflow-visible bg-opnskin-bg-card/80 border border-opnskin-primary/20 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }} shadows>
        <color attach="background" args={["#0a0a1a"]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 10, 10]} intensity={1.2} color="#00fff7" />
        <Stage intensity={1.2} environment="city" shadows="contact">
          {SKINS.map((skin, i) => (
            <group key={skin.name} position={[i * 3 - 4.5, Math.sin(i) * 1.5, 0]}>
              <Suspense fallback={null}>
                <SkinModel url={skin.model} color={skin.color} />
                <Html center distanceFactor={8} zIndexRange={[100, 0]}>
                  <div className="text-center mt-2">
                    {cryptoIcons[currency] && <img src={cryptoIcons[currency]!} alt={currency} className="inline w-5 h-5 mr-1 align-middle" />}
                    <div className="font-mono text-opnskin-accent text-sm font-bold drop-shadow-[0_0_4px_#00fff7]">
                      {formatPrice(skin.price, currency)}
                    </div>
                    <div className="text-xs text-opnskin-text-primary font-bold drop-shadow-[0_0_4px_#00fff7]">
                      {skin.name}
                    </div>
                  </div>
                </Html>
              </Suspense>
            </group>
          ))}
        </Stage>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.7} />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,247,0.10) 0%, transparent 80%)',
        zIndex: 1,
      }} />
    </div>
  );
}

// Pour charger les modèles, place les fichiers .glb dans public/models/ ou utilise des liens externes glTF libres.
// Nécessite d'ajouter "@react-three/fiber", "@react-three/drei" et "three" dans les dépendances. 