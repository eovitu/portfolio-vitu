/* eslint-disable react-refresh/only-export-components -- provider and hook share one boundary */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { contentFor, parseLocale, type Locale, type SiteContent } from '../../lib/content';

const STORAGE_KEY = 'vitu-language';

interface LanguageApi {
  locale: Locale;
  content: SiteContent;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageApi | null>(null);

function storedLocale(): Locale {
  try {
    return parseLocale(window.localStorage.getItem(STORAGE_KEY)) ?? 'en';
  } catch {
    return 'en';
  }
}

export function useLanguage(): LanguageApi {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(storedLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    updateLocale(nextLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // The selected language still works for this visit when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  const value = useMemo(
    () => ({ locale, content: contentFor(locale), setLocale }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
