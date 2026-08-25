import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd, formatKhr } from '../lib/currency'

export default function CartDrawer({ open, onClose, cart, onInc, onDec, onRemove, onClear, total, onCheckout, checking }) {
  const { lang, t } = useLanguage()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900">{t('cart')}</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 text-2xl font-bold flex items-center justify-center"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl font-bold text-gray-400">{t('cartEmpty')}</p>
              <p className="text-base text-gray-400 mt-1">{t('cartEmptyHint')}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.map((item) => {
                const name = lang === 'km' && item.nameKm ? item.nameKm : item.nameEn
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3"
                  >
                    <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        item.emoji || '📦'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">{name}</p>
                      <p className="text-base font-semibold text-emerald-700">
                        {formatUsd(item.priceUsd)} <span className="text-gray-400">{formatKhr(item.priceUsd)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onDec(item.id)}
                        className="w-11 h-11 rounded-full bg-gray-200 text-gray-800 text-2xl font-extrabold flex items-center justify-center active:scale-90 transition"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xl font-extrabold">{item.qty}</span>
                      <button
                        onClick={() => onInc(item.id)}
                        className="w-11 h-11 rounded-full bg-emerald-600 text-white text-2xl font-extrabold flex items-center justify-center active:scale-90 transition"
                      >
                        +
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t-2 border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button onClick={onClear} className="text-lg font-bold text-red-600 underline">
                {t('clearCart')}
              </button>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-400">{t('total')}</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {formatUsd(total)} <span className="text-lg text-gray-500">{formatKhr(total)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onCheckout}
              disabled={checking}
              className="w-full py-5 rounded-2xl bg-emerald-600 text-white text-2xl font-extrabold shadow-md active:scale-95 transition disabled:opacity-60"
            >
              {checking ? t('saving') : `✓ ${t('checkoutConfirm')}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
