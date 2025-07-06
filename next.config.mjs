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
  i18n: {
    locales: ['fr', 'en', 'es', 'pt', 'ru', 'zh'],
    defaultLocale: 'fr',
    localeDetection: true,
  },
}

export default nextConfig
