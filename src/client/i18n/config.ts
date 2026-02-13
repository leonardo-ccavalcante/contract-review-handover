import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enValidation from './locales/en/validation.json';
import enReports from './locales/en/reports.json';
import enContractAudit from './locales/en/contractAudit.json';
import enMerchantProfile from './locales/en/merchantProfile.json';
import enDashboard from './locales/en/dashboard.json';
import enAdmin from './locales/en/admin.json';

import esCommon from './locales/es/common.json';
import esValidation from './locales/es/validation.json';
import esReports from './locales/es/reports.json';
import esContractAudit from './locales/es/contractAudit.json';
import esMerchantProfile from './locales/es/merchantProfile.json';
import esDashboard from './locales/es/dashboard.json';
import esAdmin from './locales/es/admin.json';

import etCommon from './locales/et/common.json';
import etValidation from './locales/et/validation.json';
import etReports from './locales/et/reports.json';
import etContractAudit from './locales/et/contractAudit.json';
import etMerchantProfile from './locales/et/merchantProfile.json';
import etDashboard from './locales/et/dashboard.json';
import etAdmin from './locales/et/admin.json';

const resources = {
  en: {
    common: enCommon,
    validation: enValidation,
    reports: enReports,
    contractAudit: enContractAudit,
    merchantProfile: enMerchantProfile,
    dashboard: enDashboard,
    admin: enAdmin,
  },
  es: {
    common: esCommon,
    validation: esValidation,
    reports: esReports,
    contractAudit: esContractAudit,
    merchantProfile: esMerchantProfile,
    dashboard: esDashboard,
    admin: esAdmin,
  },
  et: {
    common: etCommon,
    validation: etValidation,
    reports: etReports,
    contractAudit: etContractAudit,
    merchantProfile: etMerchantProfile,
    dashboard: etDashboard,
    admin: etAdmin,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
