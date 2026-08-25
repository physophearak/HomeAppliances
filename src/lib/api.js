import { seedProducts } from '../data/seedProducts'

const ENDPOINT = import.meta.env.VITE_GAS_URL || ''
const LOCAL_PRODUCTS_KEY = 'jehour_products_cache'
const LOCAL_PENDING_SALES_KEY = 'jehour_pending_sales'
const LOCAL_SALES_LOG_KEY = 'jehour_sales_log'

export const isConnected = Boolean(ENDPOINT)

function readLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : seedProducts
  } catch {
    return seedProducts
  }
}

function writeLocalProducts(products) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products))
}

function logSaleLocally(sale) {
  try {
    const log = JSON.parse(localStorage.getItem(LOCAL_SALES_LOG_KEY) || '[]')
    log.push(sale)
    localStorage.setItem(LOCAL_SALES_LOG_KEY, JSON.stringify(log))
  } catch {
    // Storage full or unavailable — skip logging rather than block the sale.
  }
}

export function getSalesLog() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SALES_LOG_KEY) || '[]')
  } catch {
    return []
  }
}

function normalizeProduct(row) {
  return {
    id: String(row.id ?? row.ID ?? row.Id ?? ''),
    nameEn: row.nameEn ?? row.NameEn ?? '',
    nameKm: row.nameKm ?? row.NameKm ?? '',
    category: row.category ?? row.Category ?? 'kitchen',
    priceUsd: Number(row.priceUsd ?? row.PriceUsd ?? 0),
    stock: Number(row.stock ?? row.Stock ?? 0),
    imageUrl: row.imageUrl ?? row.ImageUrl ?? '',
    emoji: row.emoji ?? row.Emoji ?? '📦',
    sku: row.sku ?? row.Sku ?? '',
  }
}

// Apps Script web apps don't handle CORS preflight requests well, so we send
// POST bodies as text/plain (a "simple request") and parse JSON server-side.
async function postToScript(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function fetchProducts() {
  if (!ENDPOINT) {
    return readLocalProducts()
  }
  try {
    const res = await fetch(`${ENDPOINT}?action=products`)
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const data = await res.json()
    const products = (data.products || data || []).map(normalizeProduct)
    writeLocalProducts(products)
    return products
  } catch (err) {
    console.warn('Falling back to cached products:', err)
    return readLocalProducts()
  }
}

export async function recordSale({ items, total, timestamp }) {
  const sale = {
    action: 'sale',
    total,
    timestamp: timestamp || new Date().toISOString(),
    items: items.map((i) => ({ id: i.id, nameEn: i.nameEn, qty: i.qty, priceUsd: i.priceUsd })),
  }

  // Optimistically update local stock cache
  const products = readLocalProducts()
  const updated = products.map((p) => {
    const line = items.find((i) => i.id === p.id)
    return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p
  })
  writeLocalProducts(updated)
  logSaleLocally(sale)

  if (!ENDPOINT) {
    return { ok: true, offline: true }
  }
  try {
    await postToScript(sale)
    return { ok: true, offline: false }
  } catch (err) {
    console.warn('Sale failed to sync, queued offline:', err)
    const pending = JSON.parse(localStorage.getItem(LOCAL_PENDING_SALES_KEY) || '[]')
    pending.push(sale)
    localStorage.setItem(LOCAL_PENDING_SALES_KEY, JSON.stringify(pending))
    return { ok: false, offline: true }
  }
}

export async function updateStock(productId, newStock) {
  const products = readLocalProducts()
  const updated = products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
  writeLocalProducts(updated)

  if (!ENDPOINT) return { ok: true, offline: true }
  try {
    await postToScript({ action: 'updateStock', id: productId, stock: newStock })
    return { ok: true, offline: false }
  } catch (err) {
    console.warn('Stock update failed to sync:', err)
    return { ok: false, offline: true }
  }
}

export async function addProduct(product) {
  const products = readLocalProducts()
  const newProduct = normalizeProduct(product)
  writeLocalProducts([...products, newProduct])

  if (!ENDPOINT) return { ok: true, offline: true, product: newProduct }
  try {
    const res = await postToScript({ action: 'addProduct', ...newProduct })
    return { ok: true, offline: false, product: normalizeProduct(res.product || newProduct) }
  } catch (err) {
    console.warn('Add product failed to sync:', err)
    return { ok: false, offline: true, product: newProduct }
  }
}
