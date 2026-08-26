import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { fileToDataUrl } from '../lib/image'

const CATEGORY_OPTIONS = ['kitchen', 'appliances', 'cleaning', 'cooling']

const ICONS_BY_CATEGORY = {
  kitchen: ['🍚', '🫖', '🥤', '🍳', '🍞', '🔪'],
  appliances: ['🚰', '👕', '🔌', '🛁'],
  cleaning: ['🧹', '🪣', '🧯'],
  cooling: ['🌀', '❄️'],
}
const ALL_ICONS = Object.values(ICONS_BY_CATEGORY).flat()

// Puts icons that match the chosen category first, so the best fits are
// easiest to reach, while still keeping every icon reachable below.
function orderedIcons(category) {
  const matched = ICONS_BY_CATEGORY[category] || []
  const rest = ALL_ICONS.filter((icon) => !matched.includes(icon))
  return ['📦', ...matched, ...rest]
}

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

export default function ProductFormModal({ product, onSave, onClose }) {
  const { t } = useLanguage()
  const editingId = product?.id ?? null
  const [form, setForm] = useState(() => (product ? productToForm(product) : emptyForm()))
  const [saving, setSaving] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nameEn || !form.priceUsd) return
    setSaving(true)
    await onSave({
      id: editingId || `P${Date.now()}`,
      nameEn: form.nameEn,
      nameKm: form.nameKm,
      category: form.category,
      priceUsd: Number(form.priceUsd),
      stock: Number(form.stock) || 0,
      imageUrl: form.imageUrl,
      sku: form.sku,
      emoji: form.emoji,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-gray-100 shrink-0">
          <h2 className="text-xl font-extrabold text-gray-900">
            {editingId ? t('editItem') : t('addNewItem')}
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 text-2xl font-bold flex items-center justify-center shrink-0"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
          style={{ paddingBottom: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom)))' }}
        >
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
              {orderedIcons(form.category).map((icon) => (
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
      </div>
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
