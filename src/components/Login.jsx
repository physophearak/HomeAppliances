import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { loginWithPin } from '../lib/auth'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function Login({ onLogin }) {
  const { t } = useLanguage()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const press = (key) => {
    setError(false)
    if (key === '') return
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1))
      return
    }
    setPin((p) => {
      const next = (p + key).slice(0, 6)
      if (next.length >= 4) {
        const role = loginWithPin(next)
        if (role) {
          onLogin(role)
          return ''
        }
        if (next.length === 6) {
          setError(true)
          return ''
        }
      }
      return next
    })
  }

  return (
    <div className="px-4 pt-10 pb-10 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold text-gray-900">{t('loginTitle')}</h2>
      <p className="text-lg text-gray-500 mb-6 text-center">{t('loginSubtitle')}</p>

      <div className="flex gap-3 mb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={`w-5 h-5 rounded-full border-4 ${
              i < pin.length ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
      <p className={`h-7 text-base font-bold ${error ? 'text-red-600' : 'text-transparent'}`}>
        {t('loginWrongPin')}
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-2">
        {KEYS.map((key, i) => (
          <button
            key={i}
            type="button"
            disabled={key === ''}
            onClick={() => press(key)}
            className={`h-16 rounded-2xl text-2xl font-extrabold flex items-center justify-center active:scale-90 transition ${
              key === ''
                ? 'invisible'
                : 'bg-white border-4 border-gray-200 text-gray-900'
            }`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
