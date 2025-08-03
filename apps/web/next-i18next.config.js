module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'es', 'pt', 'ru', 'zh'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}; 