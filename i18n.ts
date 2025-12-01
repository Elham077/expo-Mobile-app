import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// فایل‌های ترجمه
import fa from './langs/fa.json';
import ps from './langs/ps.json';

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    lng: Localization.locale?.split('-')[0], // زبان پیش‌فرض
    fallbackLng: 'fa',
    resources: {
      fa: { translation: fa },
      ps: { translation: ps },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
