// Approximate USD -> KHR exchange rate. Owner can override it from Settings,
// or set a starting default with VITE_KHR_RATE in your .env file.
const RATE_KEY = 'jehour_khr_rate'
const DEFAULT_RATE = Number(import.meta.env.VITE_KHR_RATE) || 4100

export function getExchangeRate() {
  const stored = Number(localStorage.getItem(RATE_KEY))
  return stored > 0 ? stored : DEFAULT_RATE
}

export function setExchangeRate(rate) {
  if (!(rate > 0)) return
  localStorage.setItem(RATE_KEY, String(rate))
}

export function formatUsd(amount) {
  return `$${Number(amount).toFixed(2)}`
}

export function formatKhr(amount) {
  const khr = Math.round(Number(amount) * getExchangeRate())
  return `៛${khr.toLocaleString('en-US')}`
}
