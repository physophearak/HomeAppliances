import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd } from '../lib/currency'

const CATEGORY_OPTIONS = ['kitchen', 'appliances', 'cleaning', 'cooling']

function emptyForm() {
  return { nameEn: '', nameKm: '', category: 'kitchen', priceUsd: '', stock: '', imageUrl: '', sku: '' }
}

export default function AdminTab({ products, onUpdateStock, onAddProduct, loading }) {
  const { lang, t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const handleField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nameEn || !form.priceUsd) return
    setSaving(true)
    await onAddProduct({
      id: `P${Date.now()}`,
      nameEn: form.nameEn,
      nameKm: form.nameKm,
      category: form.category,
      priceUsd: Number(form.priceUsd),
      stock: Number(form.stock) || 0,
      imageUrl: form.imageUrl,
      sku: form.sku,
      emoji: '📦',
    })
    setSaving(false)
    setForm(emptyForm())
    setShowForm(false)
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <h2 className="text-3xl font-extrabold text-gray-900">{t('stockTitle')}</h2>
      <p className="text-lg text-gray-500 mb-4">{t('stockSubtitle')}</p>

      <button
        onClick={() => setShowForm((s) => !s)}
        className="w-full py-4 mb-4 rounded-2xl bg-gray-900 text-white text-xl font-extrabold active:scale-95 transition"
      >
        {showForm ? `✕ ${t('cancel')}` : `+ ${t('addNewItem')}`}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-4 border-gray-200 p-4 mb-5 flex flex-col gap-3">
          <Field label={t('productName')}>
            <input
              required
              value={form.nameEn}
              onChange={(e) => handleField('nameEn', e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t('productNameKm')}>
            <input
              value={form.nameKm}
              onChange={(e) => handleField('nameKm', e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t('category')}>
            <select
              value={form.category}
              onChange={(e) => handleField('category', e.target.value)}
              className="input"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex gap-3">
            <Field label={t('priceUsd')} className="flex-1">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.priceUsd}
                onChange={(e) => handleField('priceUsd', e.target.value)}
                className="input"
              />
            </Field>
            <Field label={t('quantity')} className="flex-1">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleField('stock', e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label={t('imageUrl')}>
            <input
              value={form.imageUrl}
              onChange={(e) => handleField('imageUrl', e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t('sku')}>
            <input
              value={form.sku}
              onChange={(e) => handleField('sku', e.target.value)}
              className="input"
            />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 py-4 rounded-2xl bg-emerald-600 text-white text-xl font-extrabold active:scale-95 transition disabled:opacity-60"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center text-xl font-bold text-gray-400">{t('loading')}</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((p) => {
            const name = lang === 'km' && p.nameKm ? p.nameKm : p.nameEn
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 bg-white rounded-2xl border-4 border-gray-200 p-3"
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
                  <button
                    onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 1))}
                    className="w-11 h-11 rounded-full bg-gray-200 text-gray-800 text-2xl font-extrabold flex items-center justify-center active:scale-90 transition"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xl font-extrabold">{p.stock}</span>
                  <button
                    onClick={() => onUpdateStock(p.id, p.stock + 1)}
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
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-base font-bold text-gray-600">{label}</span>
      {children}
    </label>
  )
}
