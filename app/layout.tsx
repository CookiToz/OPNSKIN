import type React from "react"
import type { Metadata } from "next"
import ClientLayout from './ClientLayout';
import { Poppins, Sora, Share_Tech_Mono, Inter } from "next/font/google"
import "./globals.css"

// Utilisation de Poppins comme alternative à Satoshi Bold
const satoshiBold = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-satoshi-bold",
})

// Utilisation de Sora comme alternative à Satoshi Regular
const satoshiRegular = Sora({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-satoshi-regular",
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono",
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OPNSKIN - Marketplace de Skins Gaming",
  description: "La marketplace de confiance pour tous vos besoins numériques. Sécurisé, rapide et fiable.",
  keywords: "skins, gaming, CS2, Dota 2, marketplace, trading, OPNSKIN",
  authors: [{ name: "OPNSKIN Team" }],
  openGraph: {
    title: "OPNSKIN - Marketplace de Skins Gaming",
    description: "La marketplace de confiance pour tous vos besoins numériques",
    type: "website",
    locale: "fr_FR",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>{children}</ClientLayout>
  )
}
