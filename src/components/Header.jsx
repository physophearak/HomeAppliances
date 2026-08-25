import { useLanguage } from '../i18n/LanguageContext'

export default function Header({ tab, setTab, connected }) {
  const { t, toggleLang } = useLanguage()

  return (
    <header className="sticky top-0 z-30 bg-white border-b-4 border-emerald-600 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
            J
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight truncate">
              {t('appName')}
            </h1>
            <p className="text-sm text-gray-500 truncate">{t('tagline')}</p>
          </div>
        </div>

        <button
          onClick={toggleLang}
          className="shrink-0 px-4 py-3 rounded-2xl bg-gray-900 text-white font-bold text-lg active:scale-95 transition"
          aria-label="Toggle language"
        >
          {t('langToggle')}
        </button>
      </div>

      <div className="flex px-4 gap-2 pb-3">
        <button
          onClick={() => setTab('pos')}
          className={`flex-1 py-4 rounded-2xl text-xl font-extrabold border-4 transition ${
            tab === 'pos'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          🛒 {t('navPos')}
        </button>
        <button
          onClick={() => setTab('admin')}
          className={`flex-1 py-4 rounded-2xl text-xl font-extrabold border-4 transition ${
            tab === 'admin'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          📦 {t('navAdmin')}
        </button>
      </div>

      {!connected && (
        <div className="bg-amber-100 text-amber-900 text-center text-sm font-semibold py-1.5 px-2">
          ⚠ {t('offlineMode')}
        </div>
      )}
    </header>
  )
}
