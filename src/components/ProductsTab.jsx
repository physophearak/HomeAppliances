import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { formatUsd } from '../lib/currency'
import { can } from '../lib/auth'
import { DEFAULT_CATEGORY_KEYS, categoryLabel, useCustomCategories } from '../lib/categories'
import ManageHeader from './ManageHeader'
import ProductFormModal from './ProductFormModal'
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
  const [category, setCategory] = useState('all')
  const customCategories = useCustomCategories()
  const canAddProduct = can(role, 'addProduct')
  const canDeleteProduct = can(role, 'deleteProduct')
  const canSwipe = canAddProduct || canDeleteProduct

  const categories = ['all', ...DEFAULT_CATEGORY_KEYS, ...customCategories.map((c) => c.key)]
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

  return (
    <div className="px-4 pt-4 pb-10">
      <ManageHeader title={t('productsTitle')} subtitle={t('productsSubtitle')} role={role} />

      {canAddProduct ? (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 mb-4 rounded-2xl bg-gray-900 text-white text-xl font-extrabold active:scale-95 transition"
        >
          + {t('addNewItem')}
        </button>
      ) : (
        <p className="text-base font-semibold text-gray-400 mb-4">{t('productsOwnerOnly')}</p>
      )}

      {!loading && (
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
    </div>
  )
}
