/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Suppression de la configuration i18n (non supportée avec App Router)
  // L'internationalisation est gérée via next-i18next dans les composants
}

export default nextConfig
