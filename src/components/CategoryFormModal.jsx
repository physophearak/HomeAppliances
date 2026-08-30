import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export default function CategoryFormModal({ mode, initial, onSave, onClose }) {
  const { t } = useLanguage()
  const [nameEn, setNameEn] = useState(initial?.nameEn || '')
  const [nameKm, setNameKm] = useState(initial?.nameKm || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nameEn.trim()) return
    onSave({ nameEn, nameKm })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-gray-100 shrink-0">
          <h2 className="text-xl font-extrabold text-gray-900">
            {mode === 'add' ? t('addCategory') : t('renameCategory')}
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 text-2xl font-bold flex items-center justify-center shrink-0"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 flex flex-col gap-3"
          style={{ paddingBottom: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom)))' }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-base font-bold text-gray-600">{t('categoryNameEn')}</span>
            <input autoFocus value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="input" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-base font-bold text-gray-600">{t('categoryNameKm')}</span>
            <input value={nameKm} onChange={(e) => setNameKm(e.target.value)} className="input" />
          </label>
          <button
            type="submit"
            disabled={!nameEn.trim()}
            className="mt-2 py-4 rounded-2xl bg-emerald-600 text-white text-xl font-extrabold active:scale-95 transition disabled:opacity-50"
          >
            {mode === 'add' ? t('addCategory') : t('saveChanges')}
          </button>
        </form>
      </div>
    </div>
  )
}
