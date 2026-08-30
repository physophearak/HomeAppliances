import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd } from '../lib/currency'
import { can } from '../lib/auth'
import {
  DEFAULT_CATEGORY_KEYS,
  addCustomCategory,
  categoryLabel,
  deleteCustomCategory,
  getCategoryOverrides,
  getHiddenDefaultCategories,
  hideDefaultCategory,
  renameCustomCategory,
  setCategoryOverride,
  useCustomCategories,
} from '../lib/categories'
import { translations } from '../i18n/translations'
import ManageHeader from './ManageHeader'
import ProductFormModal from './ProductFormModal'
import CategoryFormModal from './CategoryFormModal'
import ConfirmModal from './ConfirmModal'
import SwipeableRow from './SwipeableRow'

export default function ProductsTab({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  loading,
  role,
}) {
  const { lang, t } = useLanguage()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [openRowId, setOpenRowId] = useState(null)
  const [openCategoryRowId, setOpenCategoryRowId] = useState(null)
  const [category, setCategory] = useState(null)
  const [categoryEditor, setCategoryEditor] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const customCategories = useCustomCategories()
  const canAddProduct = can(role, 'addProduct')
  const canDeleteProduct = can(role, 'deleteProduct')
  const canSwipe = canAddProduct || canDeleteProduct

  const hiddenDefaults = getHiddenDefaultCategories()
  const categories = [
    'all',
    ...DEFAULT_CATEGORY_KEYS.filter((k) => !hiddenDefaults.includes(k)),
    ...customCategories.map((c) => c.key),
  ]
  const filteredProducts = products.filter((p) => category === 'all' || p.category === category)

  const modalOpen = showAddModal || Boolean(editingProduct)

  const closeModal = () => {
    setShowAddModal(false)
    setEditingProduct(null)
  }

  const handleSave = async (product) => {
    if (editingProduct) {
      await onUpdateProduct(product)
    } else {
      await onAddProduct(product)
    }
    closeModal()
  }

  const handleConfirmDelete = async () => {
    const productId = deletingProduct.id
    setDeletingProduct(null)
    await onDeleteProduct(productId)
  }

  const handleSaveCategory = ({ nameEn, nameKm }) => {
    if (categoryEditor.mode === 'add') {
      addCustomCategory({ nameEn, nameKm })
    } else if (categoryEditor.isCustom) {
      renameCustomCategory(categoryEditor.key, { nameEn, nameKm })
    } else {
      setCategoryOverride(categoryEditor.key, { nameEn, nameKm })
    }
    setCategoryEditor(null)
  }

  const handleConfirmDeleteCategory = () => {
    if (deletingCategory.isCustom) {
      deleteCustomCategory(deletingCategory.key)
    } else {
      hideDefaultCategory(deletingCategory.key)
    }
    setDeletingCategory(null)
  }

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader
        title={category === null ? t('productsTitle') : categoryLabel(category, customCategories, lang, t)}
        subtitle={category === null ? t('selectCategoryHint') : t('productsSubtitle')}
        role={role}
      />

      {category !== null && (
        <button
          onClick={() => setCategory(null)}
          className="mb-3 text-lg font-bold text-gray-500 active:scale-95 transition"
        >
          {t('backToCategories')}
        </button>
      )}

      {category !== null &&
        (canAddProduct ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 mb-4 rounded-2xl bg-gray-900 text-white text-xl font-extrabold active:scale-95 transition"
          >
            + {t('addNewItem')}
          </button>
        ) : (
          <p className="text-base font-semibold text-gray-400 mb-4">{t('productsOwnerOnly')}</p>
        ))}

      {category === null ? (
        <>
          {canAddProduct && (
            <button
              onClick={() => setCategoryEditor({ mode: 'add' })}
              className="w-full py-4 mb-4 rounded-2xl bg-gray-900 text-white text-xl font-extrabold active:scale-95 transition"
            >
              + {t('addCategory')}
            </button>
          )}
          {canAddProduct && categories.length > 1 && (
            <p className="text-sm font-semibold text-gray-400 mb-2 text-center">{t('swipeHint')}</p>
          )}
          <ul className="flex flex-col gap-3">
            {categories.map((c) => {
              const count = c === 'all' ? products.length : products.filter((p) => p.category === c).length
              const custom = customCategories.find((cc) => cc.key === c)
              const rowContent = (
                <div className="w-full flex items-center justify-between gap-3 bg-white border-4 border-gray-200 rounded-2xl p-4 active:scale-95 transition">
                  <span className="text-lg font-bold text-gray-900">
                    {categoryLabel(c, customCategories, lang, t)}
                  </span>
                  <span className="flex items-center gap-2 text-base font-semibold text-gray-400">
                    {count} {t('itemsShort')}
                    <span className="text-xl">›</span>
                  </span>
                </div>
              )
              return (
                <li key={c}>
                  {canAddProduct && c !== 'all' ? (
                    <SwipeableRow
                      id={c}
                      open={openCategoryRowId === c}
                      onInteract={setOpenCategoryRowId}
                      onOpen={setOpenCategoryRowId}
                      onClose={() => setOpenCategoryRowId((cur) => (cur === c ? null : cur))}
                      onTap={() => setCategory(c)}
                      leftAction={{
                        icon: '✎',
                        label: t('edit'),
                        onClick: () => {
                          const names = custom || getCategoryOverrides()[c] || {
                            nameEn: translations.en.categories[c] || c,
                            nameKm: translations.km.categories[c] || '',
                          }
                          setCategoryEditor({
                            mode: 'rename',
                            key: c,
                            isCustom: Boolean(custom),
                            nameEn: names.nameEn,
                            nameKm: names.nameKm,
                          })
                        },
                      }}
                      rightAction={{
                        icon: '🗑',
                        label: t('delete'),
                        onClick: () =>
                          setDeletingCategory({
                            key: c,
                            isCustom: Boolean(custom),
                            label: categoryLabel(c, customCategories, lang, t),
                          }),
                      }}
                    >
                      {rowContent}
                    </SwipeableRow>
                  ) : (
                    <button onClick={() => setCategory(c)} className="w-full text-left">
                      {rowContent}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      ) : loading ? (
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
        <>
          {canSwipe && filteredProducts.length > 0 && (
            <p className="text-sm font-semibold text-gray-400 mb-2 text-center">
              {t('swipeHint')}
            </p>
          )}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-xl font-bold text-gray-400">{t('noProducts')}</div>
          ) : (
          <ul className="flex flex-col gap-3">
            {filteredProducts.map((p) => {
              const name = lang === 'km' && p.nameKm ? p.nameKm : p.nameEn
              const row = (
                <div className="flex items-center gap-3 bg-white border-4 border-gray-200 p-3">
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
                      {formatUsd(p.priceUsd)} · {categoryLabel(p.category, customCategories, lang, t)}
                    </p>
                    <p className="text-sm font-semibold text-gray-400">
                      {p.stock} {t('unitsShort')}
                    </p>
                  </div>
                </div>
              )
              return (
                <li key={p.id}>
                  {canSwipe ? (
                    <SwipeableRow
                      id={p.id}
                      open={openRowId === p.id}
                      onInteract={setOpenRowId}
                      onOpen={setOpenRowId}
                      onClose={() => setOpenRowId((cur) => (cur === p.id ? null : cur))}
                      leftAction={
                        canAddProduct
                          ? { icon: '✎', label: t('edit'), onClick: () => setEditingProduct(p) }
                          : null
                      }
                      rightAction={
                        canDeleteProduct
                          ? { icon: '🗑', label: t('delete'), onClick: () => setDeletingProduct(p) }
                          : null
                      }
                    >
                      {row}
                    </SwipeableRow>
                  ) : (
                    row
                  )}
                </li>
              )
            })}
          </ul>
          )}
        </>
      )}

      {modalOpen && (
        <ProductFormModal product={editingProduct} onSave={handleSave} onClose={closeModal} />
      )}

      {categoryEditor && (
        <CategoryFormModal
          mode={categoryEditor.mode}
          initial={categoryEditor.mode === 'rename' ? categoryEditor : null}
          onSave={handleSaveCategory}
          onClose={() => setCategoryEditor(null)}
        />
      )}

      {deletingProduct && (
        <ConfirmModal
          title={t('deleteItemTitle')}
          message={
            (lang === 'km' && deletingProduct.nameKm ? deletingProduct.nameKm : deletingProduct.nameEn) +
            ' — ' +
            t('deleteItemMessage')
          }
          confirmLabel={t('delete')}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingProduct(null)}
        />
      )}

      {deletingCategory && (
        <ConfirmModal
          title={t('deleteCategoryTitle')}
          message={deletingCategory.label + ' — ' + t('deleteCategoryMessage')}
          confirmLabel={t('delete')}
          onConfirm={handleConfirmDeleteCategory}
          onClose={() => setDeletingCategory(null)}
        />
      )}
    </div>
  )
}
