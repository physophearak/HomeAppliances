import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd } from '../lib/currency'
import { can } from '../lib/auth'
import ManageHeader from './ManageHeader'

const CATEGORY_OPTIONS = ['kitchen', 'appliances', 'cleaning', 'cooling']

function emptyForm() {
  return { nameEn: '', nameKm: '', category: 'kitchen', priceUsd: '', stock: '', imageUrl: '', sku: '' }
}

export default function ProductsTab({ products, onAddProduct, loading, role, onLogout }) {
  const { lang, t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const canAddProduct = can(role, 'addProduct')

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
      <ManageHeader title={t('productsTitle')} subtitle={t('productsSubtitle')} role={role} onLogout={onLogout} />

      {canAddProduct ? (
        <button
          onClick={() => setShowForm((s) => !s)}
          className="w-full py-4 mb-4 rounded-2xl bg-gray-900 text-white text-xl font-extrabold active:scale-95 transition"
        >
          {showForm ? `✕ ${t('cancel')}` : `+ ${t('addNewItem')}`}
        </button>
      ) : (
        <p className="text-base font-semibold text-gray-400 mb-4">{t('productsOwnerOnly')}</p>
      )}

      {canAddProduct && showForm && (
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
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 bg-white rounded-2xl border-4 border-gray-100 p-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
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
                  <p className="text-base font-semibold text-gray-500">
                    {formatUsd(p.priceUsd)} · {t(`categories.${p.category}`)}
                  </p>
                </div>
                <span className="text-base font-extrabold text-gray-400 shrink-0">
                  {p.stock} {t('unitsShort')}
                </span>
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
