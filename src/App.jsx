import { useEffect, useMemo, useState } from 'react'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { fetchProducts, recordSale, updateStock, addProduct, isConnected } from './lib/api'
import Header from './components/Header'
import ProductGrid from './components/ProductGrid'
import CartBar from './components/CartBar'
import CartDrawer from './components/CartDrawer'
import AdminTab from './components/AdminTab'
import Toast from './components/Toast'

function AppInner() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('pos')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    fetchProducts().then((data) => {
      if (active) {
        setProducts(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0), [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const incItem = (id) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))

  const decItem = (id) =>
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    )

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id))
  const clearCart = () => setCart([])

  const handleCheckout = async () => {
    if (cart.length === 0 || checking) return
    setChecking(true)
    const result = await recordSale({ items: cart, total })
    setChecking(false)
    setCartOpen(false)
    setCart([])
    setProducts((prev) =>
      prev.map((p) => {
        const line = cart.find((i) => i.id === p.id)
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p
      })
    )
    setToast({
      type: result.ok ? 'success' : 'error',
      message: result.ok ? t('saleSuccess') : t('saleError'),
    })
  }

  const handleUpdateStock = async (id, newStock) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)))
    const result = await updateStock(id, newStock)
    setToast({
      type: result.ok ? 'success' : 'error',
      message: result.ok ? t('stockUpdated') : t('saleError'),
    })
  }

  const handleAddProduct = async (product) => {
    const result = await addProduct(product)
    setProducts((prev) => [...prev, result.product])
    setToast({
      type: result.ok ? 'success' : 'error',
      message: result.ok ? t('itemAdded') : t('saleError'),
    })
  }

  return (
    <div className="min-h-screen pb-28">
      <Header tab={tab} setTab={setTab} connected={isConnected} />
      <Toast toast={toast} />

      {tab === 'pos' ? (
        <>
          <ProductGrid
            products={products}
            cart={cart}
            onAdd={addToCart}
            loading={loading}
            category={category}
            setCategory={setCategory}
            search={search}
            setSearch={setSearch}
          />
          <CartBar
            cart={cart}
            total={total}
            onOpenCart={() => setCartOpen(true)}
            onCheckout={handleCheckout}
            checking={checking}
          />
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            onInc={incItem}
            onDec={decItem}
            onRemove={removeItem}
            onClear={clearCart}
            total={total}
            onCheckout={handleCheckout}
            checking={checking}
          />
        </>
      ) : (
        <AdminTab
          products={products}
          onUpdateStock={handleUpdateStock}
          onAddProduct={handleAddProduct}
          loading={loading}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
