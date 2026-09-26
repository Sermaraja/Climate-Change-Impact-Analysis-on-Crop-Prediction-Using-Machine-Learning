import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';

export type SupportedLanguage = 'en' | 'ta';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, fallbackOrOptions?: string | Record<string, any>) => string;
  translateCrop: (cropName?: string | null) => string;
  translateStage: (stage?: string | null) => string;
  translateSoilType: (soil?: string | null) => string;
  translateDrainage: (drainage?: string | null) => string;
  translateRisk: (risk?: string | null) => string;
  translateFactor: (factor?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string, fallbackOrOptions?: string | Record<string, any>) =>
    typeof fallbackOrOptions === 'string' ? fallbackOrOptions : key,
  translateCrop: (c) => c || '',
  translateStage: (s) => s || '',
  translateSoilType: (st) => st || '',
  translateDrainage: (d) => d || '',
  translateRisk: (r) => r || '',
  translateFactor: (f) => f || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t: i18nT } = useTranslation();
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'ta' || saved === 'en') {
      return saved as SupportedLanguage;
    }
    return (i18n.language === 'ta' ? 'ta' : 'en') as SupportedLanguage;
  });

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    await i18n.changeLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }

    // Try persisting to authenticated backend profile if token exists
    const token = localStorage.getItem('agri_token');
    if (token) {
      try {
        await apiClient.put('/auth/me/language', { preferred_language: lang });
        // Also update cached user profile
        const cachedUserStr = localStorage.getItem('agri_user');
        if (cachedUserStr) {
          try {
            const userObj = JSON.parse(cachedUserStr);
            userObj.preferred_language = lang.toUpperCase();
            localStorage.setItem('agri_user', JSON.stringify(userObj));
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        // Silently catch network or token expiry errors; local preference remains active
        console.warn('Could not sync language to backend user profile:', err);
      }
    }
  };

  useEffect(() => {
    // Keep html lang attribute in sync
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string, fallbackOrOptions?: string | Record<string, any>): string => {
    if (typeof fallbackOrOptions === 'string') {
      const translated = i18nT(key);
      return translated && translated !== key ? translated : fallbackOrOptions;
    }
    return i18nT(key, fallbackOrOptions || {}) as string;
  };

  const translateCrop = (cropName?: string | null): string => {
    if (!cropName) return '';
    const cleanKey = cropName.trim();
    const upperKey = cleanKey.toUpperCase();
    const translated = t(`crops.${cleanKey}`) || t(`crops.${upperKey}`);
    if (translated && !translated.startsWith('crops.')) {
      return translated;
    }
    // Specific direct fallbacks
    const map: Record<string, { en: string; ta: string }> = {
      paddy: { en: 'Paddy', ta: 'நெல்' },
      rice: { en: 'Paddy', ta: 'நெல்' },
      maize: { en: 'Maize', ta: 'மக்காச்சோளம்' },
      corn: { en: 'Maize', ta: 'மக்காச்சோளம்' },
      groundnut: { en: 'Groundnut', ta: 'நிலக்கடலை' },
      peanut: { en: 'Groundnut', ta: 'நிலக்கடலை' },
      cotton: { en: 'Cotton', ta: 'பருத்தி' },
      banana: { en: 'Banana', ta: 'வாழை' },
      sugarcane: { en: 'Sugarcane', ta: 'கரும்பு' },
      tomato: { en: 'Tomato', ta: 'தக்காளி' },
      chilli: { en: 'Chilli', ta: 'மிளகாய்' },
      onion: { en: 'Onion', ta: 'வெங்காயம்' },
      pulses: { en: 'Pulses', ta: 'பருப்பு வகைகள்' },
    };
    const lookup = map[cleanKey.toLowerCase()];
    if (lookup) {
      return language === 'ta' ? lookup.ta : lookup.en;
    }
    return cropName;
  };

  const translateStage = (stage?: string | null): string => {
    if (!stage) return '';
    const cleanKey = stage.trim();
    const upperKey = cleanKey.toUpperCase().replace(/\s+/g, '_');
    const translated = t(`growth_stages.${cleanKey}`) || t(`growth_stages.${upperKey}`);
    if (translated && !translated.startsWith('growth_stages.')) {
      return translated;
    }
    const map: Record<string, { en: string; ta: string }> = {
      seedling: { en: 'Seedling', ta: 'நாற்று பருவம்' },
      vegetative: { en: 'Vegetative', ta: 'வளர்ச்சி பருவம்' },
      tillering: { en: 'Tillering', ta: 'தூர்கட்டும் பருவம்' },
      flowering: { en: 'Flowering', ta: 'பூக்கும் நிலை' },
      fruiting: { en: 'Fruiting', ta: 'காய் பிடிக்கும் பருவம்' },
      pod_development: { en: 'Pod Development', ta: 'நெற்று வளர்ச்சி பருவம்' },
      maturity: { en: 'Maturity', ta: 'முதிர்ச்சி பருவம்' },
      harvest: { en: 'Harvest', ta: 'அறுவடை பருவம்' },
    };
    const lookup = map[cleanKey.toLowerCase().replace(/\s+/g, '_')];
    if (lookup) {
      return language === 'ta' ? lookup.ta : lookup.en;
    }
    return stage;
  };

  const translateSoilType = (soil?: string | null): string => {
    if (!soil) return '';
    const cleanKey = soil.trim();
    const keyNorm = cleanKey.toLowerCase().replace(/\s+/g, '_');
    const translated = t(`soil.${keyNorm}`);
    if (translated && !translated.startsWith('soil.')) {
      return translated;
    }
    const map: Record<string, { en: string; ta: string }> = {
      clay: { en: 'Clay', ta: 'களிமண்' },
      sandy: { en: 'Sandy', ta: 'மணற்பாங்கான மண்' },
      loam: { en: 'Loam', ta: 'வண்டல் கலந்த மண்' },
      clay_loam: { en: 'Clay Loam', ta: 'களிமண் கலந்த வண்டல் மண்' },
      sandy_loam: { en: 'Sandy Loam', ta: 'மணல் கலந்த வண்டல் மண்' },
      silty_clay: { en: 'Silty Clay', ta: 'வண்டல் களிமண்' },
      red_soil: { en: 'Red Soil', ta: 'செம்மண்' },
      black_cotton: { en: 'Black Cotton', ta: 'கரிசல் மண்' },
      alluvial: { en: 'Alluvial', ta: 'வண்டல் மண்' },
      unknown: { en: 'Unknown', ta: 'தெரியவில்லை' },
    };
    const lookup = map[keyNorm];
    if (lookup) {
      return language === 'ta' ? lookup.ta : lookup.en;
    }
    return soil;
  };

  const translateDrainage = (drainage?: string | null): string => {
    if (!drainage) return '';
    const cleanKey = drainage.trim().toUpperCase();
    const translated = t(`soil.${cleanKey}`);
    if (translated && !translated.startsWith('soil.')) {
      return translated;
    }
    const map: Record<string, { en: string; ta: string }> = {
      GOOD: { en: 'Good', ta: 'நன்று' },
      MODERATE: { en: 'Moderate', ta: 'மிதமான' },
      POOR: { en: 'Poor', ta: 'மோசமான' },
    };
    const lookup = map[cleanKey];
    if (lookup) {
      return language === 'ta' ? lookup.ta : lookup.en;
    }
    return drainage;
  };

  const translateRisk = (risk?: string | null): string => {
    if (!risk) return '';
    const upper = risk.trim().toUpperCase();
    const map: Record<string, { en: string; ta: string }> = {
      LOW: { en: 'LOW', ta: 'குறைந்த அபாயம்' },
      ELEVATED: { en: 'ELEVATED', ta: 'அதிகரித்த அபாயம்' },
      MODERATE: { en: 'MODERATE', ta: 'மிதமான அபாயம்' },
      HIGH: { en: 'HIGH', ta: 'உயர் அபாயம்' },
      CRITICAL: { en: 'CRITICAL', ta: 'மிக அதிக அபாயம்' },
      SEVERE: { en: 'SEVERE', ta: 'கடுமையான அபாயம்' },
      NONE: { en: 'NONE', ta: 'பாதிப்பு இல்லை' },
      MILD: { en: 'MILD', ta: 'லேசான பாதிப்பு' },
      TOTAL_LOSS: { en: 'TOTAL LOSS', ta: 'முழு இழப்பு' },
      LOW_WASH_RISK: { en: 'LOW', ta: 'குறைந்த அபாயம்' },
      MODERATE_WASH_RISK: { en: 'MODERATE', ta: 'மிதமான அபாயம்' },
      HIGH_WASH_RISK: { en: 'HIGH', ta: 'உயர் அபாயம்' },
    };
    const lookup = map[upper];
    if (lookup) {
      return language === 'ta' ? lookup.ta : lookup.en;
    }
    return risk;
  };

  const translateFactor = (factor?: string | null): string => {
    if (!factor) return '';
    const key = factor.trim();
    const translated = t(`alerts.factors.${key}`);
    if (translated && !translated.startsWith('alerts.factors.')) {
      return translated;
    }
    return factor;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCrop,
        translateStage,
        translateSoilType,
        translateDrainage,
        translateRisk,
        translateFactor,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
