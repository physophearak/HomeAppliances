import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd, formatKhr } from '../lib/currency'

export default function CartBar({ cart, total, onOpenCart, onCheckout, checking }) {
  const { t } = useLanguage()
  const count = cart.reduce((sum, i) => sum + i.qty, 0)

  if (count === 0) return null

  return (
    <div
      className="fixed left-0 right-0 z-40 bg-white border-t-4 border-gray-200 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] animate-slide-up"
      style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-3 p-3 max-w-3xl mx-auto">
        <button
          onClick={onOpenCart}
          className="flex-1 flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition"
        >
          <span className="relative shrink-0">
            <span className="text-3xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">
              {count}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-gray-500">{t('viewCart')}</span>
            <span className="block text-xl font-extrabold text-gray-900 truncate">
              {formatUsd(total)} <span className="text-base text-gray-500 font-semibold">{formatKhr(total)}</span>
            </span>
          </span>
        </button>

        <button
          onClick={onCheckout}
          disabled={checking}
          className="shrink-0 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-xl font-extrabold shadow-md active:scale-95 transition disabled:opacity-60"
        >
          {checking ? t('saving') : `✓ ${t('checkout')}`}
        </button>
      </div>
    </div>
  )
}
