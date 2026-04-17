import i18next from 'i18next'
import { initReactI18next, useTranslation as useI18nextTranslation } from 'react-i18next'
import { en } from './locales/en'
import { he } from './locales/he'

export type { Translations } from './locales/en'

export const supportedLanguages = ['en', 'he'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const resources = {
  en: { translation: en },
  he: { translation: he },
} as const

export function initI18n(lng: SupportedLanguage = 'en') {
  return i18next.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
}

export function getDirection(lng: SupportedLanguage): 'ltr' | 'rtl' {
  return lng === 'he' ? 'rtl' : 'ltr'
}

export { useI18nextTranslation as useTranslation }
export { Trans } from 'react-i18next'
