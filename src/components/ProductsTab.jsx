import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd } from '../lib/currency'
import { can } from '../lib/auth'
import { fileToDataUrl } from '../lib/image'
import ManageHeader from './ManageHeader'

const CATEGORY_OPTIONS = ['kitchen', 'appliances', 'cleaning', 'cooling']
const ICON_OPTIONS = [
  '📦', '🍚', '🌀', '🫖', '🥤', '🍳', '🧹', '❄️',
  '🍞', '🚰', '👕', '🔪', '🪣', '🔌', '🧯', '🛁',
]

function emptyForm() {
  return { nameEn: '', nameKm: '', category: 'kitchen', priceUsd: '', stock: '', imageUrl: '', emoji: '📦', sku: '' }
}

function productToForm(p) {
  return {
    nameEn: p.nameEn,
    nameKm: p.nameKm,
    category: p.category,
    priceUsd: String(p.priceUsd),
    stock: String(p.stock),
    imageUrl: p.imageUrl || '',
    emoji: p.emoji || '📦',
    sku: p.sku || '',
  }
}

export default function ProductsTab({ products, onAddProduct, onUpdateProduct, loading, role }) {
  const { lang, t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const canAddProduct = can(role, 'addProduct')
  const fileInputRef = useRef(null)

  const handleField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleChooseIcon = (icon) => setForm((f) => ({ ...f, emoji: icon, imageUrl: '' }))

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    handleField('imageUrl', dataUrl)
  }

  const openAddForm = () => {
    setForm(emptyForm())
    setEditingId(null)
    setShowForm(true)
  }

  const openEditForm = (p) => {
    setForm(productToForm(p))
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nameEn || !form.priceUsd) return
    setSaving(true)
    const product = {
      id: editingId || `P${Date.now()}`,
      nameEn: form.nameEn,
      nameKm: form.nameKm,
      category: form.category,
      priceUsd: Number(form.priceUsd),
      stock: Number(form.stock) || 0,
      imageUrl: form.imageUrl,
      sku: form.sku,
      emoji: form.emoji,
    }
    if (editingId) {
      await onUpdateProduct(product)
    } else {
      await onAddProduct(product)
    }
    setSaving(false)
    setForm(emptyForm())
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('productsTitle')} subtitle={t('productsSubtitle')} role={role} />

      {canAddProduct ? (
        <button
          onClick={() => (showForm ? setShowForm(false) : openAddForm())}
          className="w-full py-4 mb-4 rounded-2xl bg-gray-900 text-white text-xl font-extrabold active:scale-95 transition"
        >
          {showForm ? `✕ ${t('cancel')}` : `+ ${t('addNewItem')}`}
        </button>
      ) : (
        <p className="text-base font-semibold text-gray-400 mb-4">{t('productsOwnerOnly')}</p>
      )}

      {canAddProduct && showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-4 border-gray-200 p-4 mb-5 flex flex-col gap-3">
          <p className="text-lg font-extrabold text-gray-900">
            {editingId ? t('editItem') : t('addNewItem')}
          </p>
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
          <Field label={t('productImage')}>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  form.emoji
                )}
              </div>
              <div className="flex flex-col items-start gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-800 text-base font-bold active:scale-95 transition"
                >
                  📷 {t('uploadPhoto')}
                </button>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => handleField('imageUrl', '')}
                    className="text-sm font-bold text-red-600 underline"
                  >
                    {t('removePhoto')}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </Field>
          <Field label={t('chooseIcon')}>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleChooseIcon(icon)}
                  className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center border-4 transition ${
                    !form.imageUrl && form.emoji === icon
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
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
            {saving ? t('saving') : editingId ? t('saveChanges') : t('save')}
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
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => canAddProduct && openEditForm(p)}
                  disabled={!canAddProduct}
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
                    <p className="text-base font-semibold text-gray-500">
                      {formatUsd(p.priceUsd)} · {t(`categories.${p.category}`)}
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-gray-400 shrink-0">
                    {p.stock} {t('unitsShort')}
                  </span>
                  {canAddProduct && <span className="text-gray-300 text-xl ml-1">›</span>}
                </button>
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
