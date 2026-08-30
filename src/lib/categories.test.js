import { beforeEach, describe, expect, it } from 'vitest'
import {
  addCustomCategory,
  categoryLabel,
  deleteCustomCategory,
  getCategoryOverrides,
  getCustomCategories,
  getHiddenDefaultCategories,
  hideDefaultCategory,
  renameCustomCategory,
  setCategoryOverride,
} from './categories'

beforeEach(() => {
  localStorage.clear()
})

describe('addCustomCategory', () => {
  it('stores a new category and returns it with a slugified key', () => {
    const category = addCustomCategory({ nameEn: 'Gaming Gear', nameKm: 'ហ្គេម' })
    expect(category).toEqual({ key: 'gaming-gear', nameEn: 'Gaming Gear', nameKm: 'ហ្គេម' })
    expect(getCustomCategories()).toEqual([category])
  })

  it('dedupes slug collisions against existing custom categories', () => {
    addCustomCategory({ nameEn: 'Gaming', nameKm: '' })
    const second = addCustomCategory({ nameEn: 'Gaming', nameKm: '' })
    expect(second.key).toBe('gaming-2')
  })

  it('dedupes slug collisions against built-in category keys', () => {
    const category = addCustomCategory({ nameEn: 'Kitchen', nameKm: '' })
    expect(category.key).toBe('kitchen-2')
  })
})

describe('renameCustomCategory', () => {
  it('updates the name fields while keeping the key stable', () => {
    const category = addCustomCategory({ nameEn: 'Gaming', nameKm: '' })
    renameCustomCategory(category.key, { nameEn: 'Gaming Gear', nameKm: 'ហ្គេម' })
    expect(getCustomCategories()).toEqual([
      { key: category.key, nameEn: 'Gaming Gear', nameKm: 'ហ្គេម' },
    ])
  })
})

describe('deleteCustomCategory', () => {
  it('removes only the targeted category', () => {
    const a = addCustomCategory({ nameEn: 'Gaming', nameKm: '' })
    const b = addCustomCategory({ nameEn: 'Toys', nameKm: '' })
    deleteCustomCategory(a.key)
    expect(getCustomCategories()).toEqual([b])
  })

  it('is a no-op when the key does not exist', () => {
    const a = addCustomCategory({ nameEn: 'Gaming', nameKm: '' })
    deleteCustomCategory('missing-key')
    expect(getCustomCategories()).toEqual([a])
  })
})

describe('setCategoryOverride', () => {
  it('stores a rename for a built-in category', () => {
    setCategoryOverride('kitchen', { nameEn: 'Kitchen Stuff', nameKm: '' })
    expect(getCategoryOverrides()).toEqual({ kitchen: { nameEn: 'Kitchen Stuff', nameKm: '' } })
  })
})

describe('hideDefaultCategory', () => {
  it('adds the key to the hidden list without duplicating it', () => {
    hideDefaultCategory('cleaning')
    hideDefaultCategory('cleaning')
    expect(getHiddenDefaultCategories()).toEqual(['cleaning'])
  })
})

describe('categoryLabel', () => {
  const t = (key) => `translated:${key}`

  it('resolves built-in categories through the translator', () => {
    expect(categoryLabel('kitchen', [], 'en', t)).toBe('translated:categories.kitchen')
  })

  it('resolves an overridden built-in category to its stored name', () => {
    setCategoryOverride('kitchen', { nameEn: 'Kitchen Stuff', nameKm: 'របស់ផ្ទះបាយ' })
    expect(categoryLabel('kitchen', [], 'en', t)).toBe('Kitchen Stuff')
    expect(categoryLabel('kitchen', [], 'km', t)).toBe('របស់ផ្ទះបាយ')
  })

  it('resolves a custom category to its English name in English mode', () => {
    const custom = [{ key: 'gaming', nameEn: 'Gaming', nameKm: 'ហ្គេម' }]
    expect(categoryLabel('gaming', custom, 'en', t)).toBe('Gaming')
  })

  it('resolves a custom category to its Khmer name in Khmer mode', () => {
    const custom = [{ key: 'gaming', nameEn: 'Gaming', nameKm: 'ហ្គេម' }]
    expect(categoryLabel('gaming', custom, 'km', t)).toBe('ហ្គេម')
  })

  it('falls back to the English name when Khmer name is missing', () => {
    const custom = [{ key: 'gaming', nameEn: 'Gaming', nameKm: '' }]
    expect(categoryLabel('gaming', custom, 'km', t)).toBe('Gaming')
  })
})
