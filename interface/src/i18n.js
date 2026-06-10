import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enAuth from './locales/en/auth.json';
import enLanding from './locales/en/landing.json';
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enChat from './locales/en/chat.json';
import enOnboarding from './locales/en/onboarding.json';
import enProfile from './locales/en/profile.json';

import arAuth from './locales/ar/auth.json';
import arLanding from './locales/ar/landing.json';
import arCommon from './locales/ar/common.json';
import arDashboard from './locales/ar/dashboard.json';
import arChat from './locales/ar/chat.json';
import arOnboarding from './locales/ar/onboarding.json';
import arProfile from './locales/ar/profile.json';

import frAuth from './locales/fr/auth.json';
import frLanding from './locales/fr/landing.json';
import frCommon from './locales/fr/common.json';
import frDashboard from './locales/fr/dashboard.json';
import frChat from './locales/fr/chat.json';
import frOnboarding from './locales/fr/onboarding.json';
import frProfile from './locales/fr/profile.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: { escapeValue: false },
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    resources: {
      en: {
        auth: enAuth,
        landing: enLanding,
        common: enCommon,
        dashboard: enDashboard,
        chat: enChat,
        onboarding: enOnboarding,
        profile: enProfile,
      },
      ar: {
        auth: arAuth,
        landing: arLanding,
        common: arCommon,
        dashboard: arDashboard,
        chat: arChat,
        onboarding: arOnboarding,
        profile: arProfile,
      },
      fr: {
        auth: frAuth,
        landing: frLanding,
        common: frCommon,
        dashboard: frDashboard,
        chat: frChat,
        onboarding: frOnboarding,
        profile: frProfile,
      },
    },
  });

i18next.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18next.language;

export default i18next;
