import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('jehour_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('jehour_lang', lang)
    document.body.setAttribute('data-lang', lang)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const toggleLang = () => setLang((l) => (l === 'en' ? 'km' : 'en'))

  const t = (key) => {
    const value = get(translations[lang], key)
    if (value == null) return get(translations.en, key) ?? key
    return value
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
