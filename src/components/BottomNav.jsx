import { useLanguage } from '../i18n/LanguageContext'

const STAFF_TABS = ['pos', 'stock', 'settings']

export default function BottomNav({ tab, setTab, role }) {
  const { t } = useLanguage()

  const allTabs = [
    { id: 'pos', label: t('navPos'), icon: '🛒' },
    { id: 'stock', label: t('navStock'), icon: '📦' },
    { id: 'products', label: t('navProducts'), icon: '🏷️' },
    { id: 'reports', label: t('navReports'), icon: '📊' },
    { id: 'settings', label: t('navSettings'), icon: '⚙️' },
  ]

  const tabs = role === 'staff' ? allTabs.filter((item) => STAFF_TABS.includes(item.id)) : allTabs

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 flex"
      style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 relative min-w-0"
          >
            <span
              className={`text-xl transition-transform ${active ? 'scale-110' : 'opacity-60'}`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[11px] font-bold transition-colors truncate max-w-full px-0.5 ${
                active ? 'text-emerald-700' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
            {active && (
              <span className="absolute top-0 h-1 w-8 rounded-full bg-emerald-600" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
