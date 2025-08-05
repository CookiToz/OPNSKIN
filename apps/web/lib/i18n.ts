import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "fr",
      supportedLngs: ["fr", "en", "es", "pt", "ru", "zh"],
      ns: ["common"],
      defaultNS: "common",
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      detection: {
        order: ["localStorage", "cookie", "navigator"],
        caches: ["localStorage", "cookie"],
      },
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
        requestOptions: {
          cache: 'default'
        }
      },
      debug: false, // Désactivé pour la production
      initImmediate: true, // Changé à true pour un chargement immédiat
      preload: ['fr'], // Précharger le français
      load: 'languageOnly', // Charger seulement la langue, pas la région
    });
}

export default i18n; 