import { useLanguage } from '../i18n/LanguageContext'
import { DEFAULT_CATEGORY_KEYS, categoryLabel, useCustomCategories } from '../lib/categories'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, cart, onAdd, loading, category, setCategory, search, setSearch }) {
  const { lang, t } = useLanguage()
  const customCategories = useCustomCategories()

  const categories = ['all', ...DEFAULT_CATEGORY_KEYS, ...customCategories.map((c) => c.key)]

  const filtered = products.filter((p) => {
    const matchesCategory = category === 'all' || p.category === category
    const matchesSearch =
      !search ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.nameKm.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="px-4 pt-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full mb-3 px-5 py-4 text-xl rounded-2xl border-4 border-gray-200 focus:border-emerald-500 outline-none bg-white"
      />

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-5 py-3 rounded-full text-lg font-bold border-4 transition ${
              category === c
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {categoryLabel(c, customCategories, lang, t)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl border-4 border-gray-100 overflow-hidden bg-white">
              <div className="w-full aspect-square bg-gray-100 animate-pulse" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-5 w-1/2 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-xl font-bold text-gray-400">{t('noProducts')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              qtyInCart={cart.find((c) => c.id === p.id)?.qty || 0}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}
