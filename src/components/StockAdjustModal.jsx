import { useLanguage } from '../i18n/LanguageContext'

const QUICK_ADD = [5, 10, 50]

export default function StockAdjustModal({ product, onUpdateStock, onClose }) {
  const { lang, t } = useLanguage()

  if (!product) return null

  const name = lang === 'km' && product.nameKm ? product.nameKm : product.nameEn
  const setStock = (next) => onUpdateStock(product.id, Math.max(0, next))

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                product.emoji || '📦'
              )}
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 truncate">{name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 text-2xl font-bold flex items-center justify-center shrink-0"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <div
          className="flex flex-col items-center gap-6 px-5 py-6"
          style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
        >
          <div className="flex items-center gap-5">
            <button
              onClick={() => setStock(product.stock - 1)}
              className="w-14 h-14 rounded-full bg-gray-200 text-gray-800 text-3xl font-extrabold flex items-center justify-center active:scale-90 transition"
            >
              −
            </button>
            <div className="flex flex-col items-center w-24">
              <span className="text-4xl font-extrabold text-gray-900">{product.stock}</span>
              <span className="text-sm font-semibold text-gray-400">{t('unitsShort')}</span>
            </div>
            <button
              onClick={() => setStock(product.stock + 1)}
              className="w-14 h-14 rounded-full bg-emerald-600 text-white text-3xl font-extrabold flex items-center justify-center active:scale-90 transition"
            >
              +
            </button>
          </div>

          <div className="w-full">
            <p className="text-base font-bold text-gray-600 mb-2 text-center">{t('quickAdd')}</p>
            <div className="flex items-center justify-center gap-3">
              {QUICK_ADD.map((n) => (
                <button
                  key={n}
                  onClick={() => setStock(product.stock + n)}
                  className="flex-1 py-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xl font-extrabold active:scale-95 transition"
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
