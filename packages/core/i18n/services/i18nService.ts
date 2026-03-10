/**
 * i18n Service
 * Mengelola language preference dan translations
 */
import SecureStorage from '../../native/SecureStorage';
import type { Language, TranslationKey, TranslationParams } from '../types';
import { id } from '../locales/id';
import { en } from '../locales/en';

const LANGUAGE_STORAGE_KEY = '@closepay_language';

/**
 * Translation resources
 */
const translations: Record<Language, Record<string, any>> = {
  id,
  en,
};

/**
 * Get nested value dari object menggunakan dot notation
 * Contoh: 'auth.login' -> translations['auth']['login']
 */
const getNestedValue = (obj: any, path: string): string | undefined => {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
};

/**
 * Replace parameters dalam translation string
 * Contoh: 'Hello {name}' dengan { name: 'John' } -> 'Hello John'
 */
const replaceParams = (text: string, params?: TranslationParams): string => {
  if (!params) {
    return text;
  }

  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }

  return result;
};

/**
 * Get translation by key
 * Safeguard: only use language if it exists in translations to avoid "Property 'x' doesn't exist" (e.g. 'he' from browser/storage).
 */
export const getTranslation = (
  key: TranslationKey,
  language: Language,
  params?: TranslationParams
): string => {
  const safeLang: Language = language === 'id' || language === 'en' ? language : 'id';
  const resource = translations[safeLang];
  if (!resource) {
    console.warn(`Translation resource not found for language: ${language}`);
    return key; // Return key as fallback
  }

  const translation = getNestedValue(resource, key);

  if (!translation) {
    console.warn(`Translation key not found: ${key} for language: ${language}`);
    return key; // Return key as fallback
  }

  return replaceParams(translation, params);
};

/**
 * Load language preference dari storage
 */
export const loadLanguagePreference = async (): Promise<Language> => {
  try {
    const stored = await SecureStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'id' || stored === 'en')) {
      return stored as Language;
    }
  } catch (error) {
    console.error('Failed to load language preference:', error);
  }
  return 'id'; // Default: Bahasa Indonesia
};

/**
 * Save language preference ke storage
 * Only persist 'id' or 'en'; ignore invalid codes to avoid runtime "Property 'x' doesn't exist".
 */
export const saveLanguagePreference = async (language: Language): Promise<void> => {
  const safeLang: Language = language === 'id' || language === 'en' ? language : 'id';
  try {
    await SecureStorage.setItem(LANGUAGE_STORAGE_KEY, safeLang);
  } catch (error) {
    console.error('Failed to save language preference:', error);
    throw error;
  }
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = (): Language[] => {
  return ['id', 'en'];
};

/**
 * Get language display name
 * Safeguard: fallback to 'id' if language is not supported (e.g. 'he').
 */
export const getLanguageName = (language: Language): string => {
  const names: Record<Language, string> = {
    id: 'Bahasa Indonesia',
    en: 'English',
  };
  const safeLang: Language = language === 'id' || language === 'en' ? language : 'id';
  return names[safeLang];
};

