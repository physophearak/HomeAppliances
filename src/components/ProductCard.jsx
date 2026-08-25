import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd, formatKhr } from '../lib/currency'

export default function ProductCard({ product, qtyInCart, onAdd }) {
  const { lang, t } = useLanguage()
  const name = lang === 'km' && product.nameKm ? product.nameKm : product.nameEn
  const outOfStock = product.stock <= 0
  const low = product.stock > 0 && product.stock <= 3

  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={`relative flex flex-col items-stretch text-left bg-white rounded-3xl border-4 overflow-hidden shadow-sm transition
        ${outOfStock ? 'opacity-50 border-gray-200' : 'border-gray-200 active:border-emerald-500 active:scale-[0.98] hover:border-emerald-400'}`}
    >
      {qtyInCart > 0 && (
        <span className="absolute top-2 right-2 z-10 bg-emerald-600 text-white text-lg font-extrabold w-9 h-9 rounded-full flex items-center justify-center shadow">
          {qtyInCart}
        </span>
      )}

      <div className="w-full aspect-square bg-emerald-50 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl">{product.emoji || '📦'}</span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <span className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.6em]">
          {name}
        </span>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-extrabold text-emerald-700">
            {formatUsd(product.priceUsd)}
          </span>
          <span className="text-base font-semibold text-gray-500">
            {formatKhr(product.priceUsd)}
          </span>
        </div>
        <span
          className={`text-sm font-bold mt-1 ${
            outOfStock ? 'text-red-600' : low ? 'text-amber-600' : 'text-gray-400'
          }`}
        >
          {outOfStock ? t('outOfStock') : low ? `${t('lowStock')} · ${product.stock}` : `${product.stock} ${t('unitsShort')}`}
        </span>
      </div>
    </button>
  )
}
