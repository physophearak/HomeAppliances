import { useLanguage } from '../i18n/LanguageContext'

export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl flex flex-col animate-slide-up">
        <div
          className="flex flex-col gap-2 px-5 pt-6"
          style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
        >
          <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
          <p className="text-base font-semibold text-gray-500 mb-4">{message}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-800 text-lg font-extrabold active:scale-95 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-lg font-extrabold active:scale-95 transition"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
