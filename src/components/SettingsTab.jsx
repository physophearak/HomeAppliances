import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { isConnected, getGasUrl, setGasUrl, clearGasUrl, testConnection } from '../lib/api'
import { getExchangeRate } from '../lib/currency'
import { can } from '../lib/auth'
import ManageHeader from './ManageHeader'

export default function SettingsTab({ role, onLogout, onUpdateExchangeRate, onConnectionChange }) {
  const { t } = useLanguage()
  const canEditRate = can(role, 'editExchangeRate')
  const canManageConnection = can(role, 'manageConnection')
  const [rate, setRate] = useState(getExchangeRate())
  const [rateInput, setRateInput] = useState(String(getExchangeRate()))
  const [gasUrl, setGasUrlState] = useState(getGasUrl())
  const [urlInput, setUrlInput] = useState(getGasUrl())
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  const handleSaveRate = (e) => {
    e.preventDefault()
    const next = Number(rateInput)
    if (!next || next <= 0) return
    onUpdateExchangeRate(next)
    setRate(next)
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    const trimmed = urlInput.trim()
    if (!trimmed) return
    setConnecting(true)
    setConnectError('')
    const ok = await testConnection(trimmed)
    setConnecting(false)
    if (!ok) {
      setConnectError(t('connectionFailed'))
      return
    }
    setGasUrl(trimmed)
    setGasUrlState(trimmed)
    onConnectionChange()
  }

  const handleDisconnect = () => {
    clearGasUrl()
    setGasUrlState('')
    setUrlInput('')
    setConnectError('')
    onConnectionChange()
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('settingsTitle')} subtitle={t('settingsSubtitle')} role={role} />

      <div className="flex flex-col gap-3 mb-6">
        <Row label={t('connectionStatus')} value={isConnected() ? t('connected') : t('notConnected')} />

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

        {canManageConnection ? (
          <form
            onSubmit={handleConnect}
            className="bg-white rounded-2xl border-4 border-gray-100 p-4 flex flex-col gap-3"
          >
            <p className="text-sm font-bold text-gray-500">{t('sheetUrl')}</p>
            <input
              type="url"
              placeholder={t('sheetUrlPlaceholder')}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="input"
            />
            {connectError && <p className="text-sm font-bold text-red-600">{connectError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={connecting || !urlInput.trim()}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-lg font-extrabold active:scale-95 transition disabled:opacity-40"
              >
                {connecting ? t('connecting') : t('connect')}
              </button>
              {gasUrl && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-lg font-extrabold active:scale-95 transition"
                >
                  {t('disconnect')}
                </button>
              )}
            </div>
          </form>
        ) : (
          gasUrl && <Row label={t('sheetUrl')} value={gasUrl} wrap />
        )}
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
