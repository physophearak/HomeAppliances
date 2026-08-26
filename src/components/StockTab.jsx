import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd } from '../lib/currency'
import { can } from '../lib/auth'
import ManageHeader from './ManageHeader'
import StockAdjustModal from './StockAdjustModal'

export default function StockTab({ products, onUpdateStock, loading, role }) {
  const { lang, t } = useLanguage()
  const canAdjustStock = can(role, 'adjustStock')
  const [selectedId, setSelectedId] = useState(null)
  const selectedProduct = products.find((p) => p.id === selectedId) || null

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('stockTitle')} subtitle={t('stockSubtitle')} role={role} />

      {!canAdjustStock && (
        <p className="text-base font-semibold text-gray-400 mb-4">{t('stockOwnerOnly')}</p>
      )}

      {loading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 bg-white rounded-2xl border-4 border-gray-100 p-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="w-24 h-11 rounded-full bg-gray-100 animate-pulse shrink-0" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((p) => {
            const name = lang === 'km' && p.nameKm ? p.nameKm : p.nameEn
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => canAdjustStock && setSelectedId(p.id)}
                  disabled={!canAdjustStock}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl border-4 border-gray-200 p-3 text-left active:scale-[0.98] transition disabled:active:scale-100"
                >
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      p.emoji || '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">{name}</p>
                    <p className="text-base font-semibold text-gray-500">{formatUsd(p.priceUsd)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xl font-extrabold text-gray-900">{p.stock}</span>
                    <span className="text-sm font-semibold text-gray-400">{t('unitsShort')}</span>
                    {canAdjustStock && <span className="text-gray-300 text-xl ml-1">›</span>}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {canAdjustStock && (
        <StockAdjustModal
          product={selectedProduct}
          onUpdateStock={onUpdateStock}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
