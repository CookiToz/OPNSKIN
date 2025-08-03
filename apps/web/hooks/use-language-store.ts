import { create } from 'zustand';

export type Language = 'fr' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (l: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'fr',
  setLanguage: (language) => set({ language }),
})); 