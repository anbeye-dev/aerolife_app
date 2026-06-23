import { fr } from './translations/fr';
import { en } from './translations/en';

export type Language = 'fr' | 'en';
export type Translations = typeof fr;

const translations: Record<Language, Translations> = {
  fr,
  en,
};

let currentLanguage: Language = 'fr';

export const i18n = {
  get language(): Language {
    return currentLanguage;
  },

  setLanguage(lang: Language): void {
    currentLanguage = lang;
  },

  t: translations[currentLanguage],

  translate(lang?: Language): Translations {
    if (lang) {
      return translations[lang];
    }
    return translations[currentLanguage];
  },
};

// Hook for components
export function useTranslation(language?: Language): Translations {
  const lang = language || currentLanguage;
  return translations[lang];
}
