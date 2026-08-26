import { useLanguage } from '../i18n/LanguageContext'

export default function Header({ connected }) {
  const { t, toggleLang } = useLanguage()

  return (
    <header
      className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-xl font-extrabold shrink-0 shadow-sm">
            J
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight truncate">
              {t('appName')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
              connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            {connected ? t('onlineShort') : t('offlineShort')}
          </span>

          <button
            onClick={toggleLang}
            className="shrink-0 px-3.5 py-2.5 rounded-full bg-gray-900 text-white font-bold text-base active:scale-95 transition"
            aria-label="Toggle language"
          >
            {t('langToggle')}
          </button>
        </div>
      </div>
    </header>
  )
}
