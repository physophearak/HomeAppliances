import { useEffect, useMemo, useState } from 'react'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { fetchProducts, recordSale, updateStock, addProduct, updateProduct, isConnected } from './lib/api'
import { getStoredRole, logout as logoutRole } from './lib/auth'
import { setExchangeRate } from './lib/currency'
import Header from './components/Header'
import ProductGrid from './components/ProductGrid'
import CartBar from './components/CartBar'
import CartDrawer from './components/CartDrawer'
import StockTab from './components/StockTab'
import ProductsTab from './components/ProductsTab'
import ReportsTab from './components/ReportsTab'
import SettingsTab from './components/SettingsTab'
import Login from './components/Login'
import Toast from './components/Toast'
import BottomNav from './components/BottomNav'

const PROTECTED_TABS = ['stock', 'products', 'reports', 'settings']

function AppInner() {
  const { t } = useLanguage()
  const [tab, setTab] = useState(() => (getStoredRole() ? 'pos' : 'stock'))
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState(null)
  const [role, setRole] = useState(() => getStoredRole())

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

  const handleUpdateProduct = async (product) => {
    const result = await updateProduct(product)
    setProducts((prev) => prev.map((p) => (p.id === result.product.id ? result.product : p)))
    setToast({
      type: result.ok ? 'success' : 'error',
      message: result.ok ? t('itemUpdated') : t('saleError'),
    })
  }

  const handleUpdateExchangeRate = (rate) => {
    setExchangeRate(rate)
    setToast({ type: 'success', message: t('exchangeRateUpdated') })
  }

  const handleConnectionChange = async () => {
    setLoading(true)
    const data = await fetchProducts()
    setProducts(data)
    setLoading(false)
    setToast({
      type: 'success',
      message: isConnected() ? t('sheetConnected') : t('sheetDisconnected'),
    })
  }

  const handleLogout = () => {
    logoutRole()
    setRole(null)
    setCategory('all')
    setSearch('')
    setTab('stock')
  }

  const hasCartItems = cart.length > 0
  const showingLogin = PROTECTED_TABS.includes(tab) && !role

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header connected={isConnected()} />
      <Toast toast={toast} />

      <div
        key={tab}
        className="flex-1 animate-fade-in"
        style={{
          paddingBottom: showingLogin
            ? '0px'
            : `calc(5.25rem + env(safe-area-inset-bottom) + ${
                tab === 'pos' && hasCartItems ? '5rem' : '0px'
              })`,
        }}
      >
        {tab === 'pos' ? (
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
        ) : !role ? (
          <Login
            onLogin={(loggedInRole) => {
              setRole(loggedInRole)
              setTab('pos')
            }}
          />
        ) : tab === 'stock' ? (
          <StockTab
            products={products}
            onUpdateStock={handleUpdateStock}
            loading={loading}
            role={role}
          />
        ) : tab === 'products' ? (
          <ProductsTab
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            loading={loading}
            role={role}
          />
        ) : tab === 'reports' ? (
          <ReportsTab role={role} />
        ) : (
          <SettingsTab
            role={role}
            onLogout={handleLogout}
            onUpdateExchangeRate={handleUpdateExchangeRate}
            onConnectionChange={handleConnectionChange}
          />
        )}
      </div>

      {tab === 'pos' && (
        <>
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
      )}

      {!showingLogin && <BottomNav tab={tab} setTab={setTab} role={role} />}
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
