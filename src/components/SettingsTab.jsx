import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { isConnected } from '../lib/api'
import { getExchangeRate } from '../lib/currency'
import { can } from '../lib/auth'
import ManageHeader from './ManageHeader'

const GAS_URL = import.meta.env.VITE_GAS_URL || ''

export default function SettingsTab({ role, onLogout, onUpdateExchangeRate }) {
  const { t } = useLanguage()
  const canEditRate = can(role, 'editExchangeRate')
  const [rate, setRate] = useState(getExchangeRate())
  const [rateInput, setRateInput] = useState(String(getExchangeRate()))

  const handleSaveRate = (e) => {
    e.preventDefault()
    const next = Number(rateInput)
    if (!next || next <= 0) return
    onUpdateExchangeRate(next)
    setRate(next)
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('settingsTitle')} subtitle={t('settingsSubtitle')} role={role} />

      <div className="flex flex-col gap-3 mb-6">
        <Row label={t('connectionStatus')} value={isConnected ? t('connected') : t('notConnected')} />

        {canEditRate ? (
          <form
            onSubmit={handleSaveRate}
            className="bg-white rounded-2xl border-4 border-gray-100 p-4 flex flex-col gap-3"
          >
            <p className="text-sm font-bold text-gray-500">{t('exchangeRate')}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-gray-900 shrink-0">1 USD =</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="input flex-1"
              />
              <span className="text-lg font-extrabold text-gray-900 shrink-0">៛</span>
            </div>
            <button
              type="submit"
              disabled={Number(rateInput) === rate || !Number(rateInput)}
              className="py-3 rounded-2xl bg-emerald-600 text-white text-lg font-extrabold active:scale-95 transition disabled:opacity-40"
            >
              {t('saveChanges')}
            </button>
          </form>
        ) : (
          <Row label={t('exchangeRate')} value={`1 USD = ${rate.toLocaleString('en-US')}៛`} />
        )}

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
