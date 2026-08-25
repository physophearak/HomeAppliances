import { useLanguage } from '../i18n/LanguageContext'

export default function ManageHeader({ title, subtitle, role, onLogout }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="text-lg text-gray-500">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
        <span
          className={`px-3 py-1 rounded-full text-sm font-extrabold whitespace-nowrap ${
            role === 'owner' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
          }`}
        >
          {role === 'owner' ? t('roleOwner') : t('roleStaff')}
        </span>
        <button
          onClick={onLogout}
          className="text-sm font-bold text-gray-400 active:text-gray-600 transition"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
