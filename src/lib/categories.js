import { useEffect, useState } from 'react'

const CATEGORIES_KEY = 'jehour_custom_categories'
const CHANGE_EVENT = 'jehour:categories-changed'

// The four built-in categories already have translated labels in
// translations.js; anything else is a shop-added category, stored locally
// with its own English/Khmer name since it has no translation entry.
export const DEFAULT_CATEGORY_KEYS = ['kitchen', 'appliances', 'cleaning', 'cooling']

function slugify(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug || 'category'
}

export function getCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]')
  } catch {
    return []
  }
}

// Adds a shop-defined category (e.g. "Gaming" / "ហ្គេម") and returns it with
// a unique slug key, so it can be selected immediately on the product form.
export function addCustomCategory({ nameEn, nameKm }) {
  const existing = getCustomCategories()
  const taken = new Set([...DEFAULT_CATEGORY_KEYS, ...existing.map((c) => c.key)])
  const base = slugify(nameEn)
  let key = base
  let n = 2
  while (taken.has(key)) {
    key = `${base}-${n++}`
  }
  const category = { key, nameEn: nameEn.trim(), nameKm: nameKm.trim() }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify([...existing, category]))
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return category
}

// Renames a shop-defined category in place (its key/slug is unaffected, so
// existing products keep pointing at the same category).
export function renameCustomCategory(key, { nameEn, nameKm }) {
  const existing = getCustomCategories()
  const updated = existing.map((c) =>
    c.key === key ? { ...c, nameEn: nameEn.trim(), nameKm: nameKm.trim() } : c
  )
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

// Live-updates in every component using it as soon as a category is added
// anywhere in the app (e.g. from the Add New Appliance form).
export function useCustomCategories() {
  const [categories, setCategories] = useState(getCustomCategories)
  useEffect(() => {
    const onChange = () => setCategories(getCustomCategories())
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
  }, [])
  return categories
}

// Resolves a category key to a display label: translated for the four
// built-ins, or the shop's own English/Khmer name for a custom one.
export function categoryLabel(key, customCategories, lang, t) {
  const custom = customCategories.find((c) => c.key === key)
  if (custom) return (lang === 'km' && custom.nameKm ? custom.nameKm : custom.nameEn) || key
  return t(`categories.${key}`)
}
