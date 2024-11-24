import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';

const detectUserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return ['ja', 'en'].includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      ja: {
        translation: jaTranslation
      }
    },
    lng: detectUserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 