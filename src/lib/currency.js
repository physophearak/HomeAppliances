// Approximate USD -> KHR exchange rate. Adjust as needed, or override with
// VITE_KHR_RATE in your .env file.
export const KHR_RATE = Number(import.meta.env.VITE_KHR_RATE) || 4100

export function formatUsd(amount) {
  return `$${Number(amount).toFixed(2)}`
}

export function formatKhr(amount) {
  const khr = Math.round(Number(amount) * KHR_RATE)
  return `${khr.toLocaleString('en-US')}៛`
}
