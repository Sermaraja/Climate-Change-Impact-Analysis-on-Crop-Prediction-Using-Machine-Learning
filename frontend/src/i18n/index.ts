import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translation bundles
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enFarms from './locales/en/farms.json';
import enCropImpact from './locales/en/cropImpact.json';
import enAlerts from './locales/en/alerts.json';
import enWeather from './locales/en/weather.json';
import enRecommendations from './locales/en/recommendations.json';
import enClimate from './locales/en/climate.json';
import enReports from './locales/en/reports.json';
import enValidation from './locales/en/validation.json';

// Tamil translation bundles
import taCommon from './locales/ta/common.json';
import taAuth from './locales/ta/auth.json';
import taDashboard from './locales/ta/dashboard.json';
import taFarms from './locales/ta/farms.json';
import taCropImpact from './locales/ta/cropImpact.json';
import taAlerts from './locales/ta/alerts.json';
import taWeather from './locales/ta/weather.json';
import taRecommendations from './locales/ta/recommendations.json';
import taClimate from './locales/ta/climate.json';
import taReports from './locales/ta/reports.json';
import taValidation from './locales/ta/validation.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    farms: enFarms,
    cropImpact: enCropImpact,
    alerts: enAlerts,
    weather: enWeather,
    recommendations: enRecommendations,
    climate: enClimate,
    reports: enReports,
    validation: enValidation,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    dashboard: taDashboard,
    farms: taFarms,
    cropImpact: taCropImpact,
    alerts: taAlerts,
    weather: taWeather,
    recommendations: taRecommendations,
    climate: taClimate,
    reports: taReports,
    validation: taValidation,
  },
} as const;

// Read saved preference from localStorage, default to English
const initialLang = ((): string => {
  try {
    const saved = localStorage.getItem('app_language');
    if (saved && (saved.toLowerCase() === 'ta' || saved.toLowerCase() === 'en')) {
      return saved.toLowerCase();
    }
  } catch (e) {
    // Ignore localStorage access restrictions
  }
  return 'en';
})();

// Set document html lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    defaultNS,
    fallbackNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`[i18n] Missing translation key "${key}" in namespace "${ns}" for language "${lng}". Falling back to English.`);
    },
    returnNull: false,
    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
  try {
    localStorage.setItem('app_language', lng);
  } catch (e) {
    // ignore
  }
});

export default i18n;
