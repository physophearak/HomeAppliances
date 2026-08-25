import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { loginAsRole } from '../lib/auth'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

const ROLES = [
  { id: 'owner', icon: '👑' },
  { id: 'staff', icon: '🧑‍💼' },
]

export default function Login({ onLogin, onClose }) {
  const { t } = useLanguage()
  const [role, setRole] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const chooseRole = (id) => {
    setRole(id)
    setPin('')
    setError(false)
  }

  const backToRoles = () => {
    setRole(null)
    setPin('')
    setError(false)
  }

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
        if (loginAsRole(role, next)) {
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

  if (!role) {
    return (
      <div className="px-4 pt-10 pb-10 flex flex-col items-center relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-10 w-11 h-11 rounded-full bg-white border-4 border-gray-200 text-xl flex items-center justify-center active:scale-90 transition"
        >
          ✕
        </button>

        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
          {t('loginWhoIsUsing')}
        </h2>

        <div className="flex gap-4 mt-8 w-full max-w-xs">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => chooseRole(r.id)}
              className="flex-1 flex flex-col items-center gap-3 py-6 rounded-3xl bg-white border-4 border-gray-200 active:scale-95 active:border-emerald-500 transition"
            >
              <span className="text-5xl">{r.icon}</span>
              <span className="text-lg font-extrabold text-gray-900">
                {r.id === 'owner' ? t('roleOwner') : t('roleStaff')}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-10 pb-10 flex flex-col items-center relative">
      <button
        type="button"
        onClick={backToRoles}
        className="absolute left-4 top-10 w-11 h-11 rounded-full bg-white border-4 border-gray-200 text-xl flex items-center justify-center active:scale-90 transition"
      >
        ←
      </button>

      <span className="text-5xl mb-2">{ROLES.find((r) => r.id === role).icon}</span>
      <h2 className="text-3xl font-extrabold text-gray-900">
        {role === 'owner' ? t('roleOwner') : t('roleStaff')}
      </h2>
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
