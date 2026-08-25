import { useLanguage } from '../i18n/LanguageContext'
import { isConnected } from '../lib/api'
import { KHR_RATE } from '../lib/currency'
import ManageHeader from './ManageHeader'

const GAS_URL = import.meta.env.VITE_GAS_URL || ''

export default function SettingsTab({ role, onLogout }) {
  const { t } = useLanguage()

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('settingsTitle')} subtitle={t('settingsSubtitle')} role={role} />

      <div className="flex flex-col gap-3 mb-6">
        <Row label={t('connectionStatus')} value={isConnected ? t('connected') : t('notConnected')} />
        <Row label={t('exchangeRate')} value={`1 USD = ${KHR_RATE.toLocaleString('en-US')}៛`} />
        {isConnected && <Row label={t('sheetUrl')} value={GAS_URL} wrap />}
      </div>

      <button
        onClick={onLogout}
        className="w-full py-4 rounded-2xl bg-red-50 text-red-600 text-xl font-extrabold active:scale-95 transition"
      >
        {t('logout')}
      </button>
    </div>
  )
}

function Row({ label, value, wrap }) {
  return (
    <div className="bg-white rounded-2xl border-4 border-gray-100 p-4">
      <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-extrabold text-gray-900 ${wrap ? 'break-all' : ''}`}>{value}</p>
    </div>
  )
}
