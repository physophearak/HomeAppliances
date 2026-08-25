const ROLE_KEY = 'jehour_role'

// Set VITE_OWNER_PIN / VITE_STAFF_PIN in .env to override these defaults.
const PINS = {
  owner: import.meta.env.VITE_OWNER_PIN || '1234',
  staff: import.meta.env.VITE_STAFF_PIN || '0000',
}

export function getStoredRole() {
  const role = localStorage.getItem(ROLE_KEY)
  return role === 'owner' || role === 'staff' ? role : null
}

export function loginWithPin(pin) {
  const match = Object.entries(PINS).find(([, rolePin]) => rolePin === pin)
  const role = match ? match[0] : null
  if (role) localStorage.setItem(ROLE_KEY, role)
  return role
}

export function logout() {
  localStorage.removeItem(ROLE_KEY)
}

export const PERMISSIONS = {
  owner: { addProduct: true, adjustStock: true },
  staff: { addProduct: false, adjustStock: true },
}

export function can(role, permission) {
  return Boolean(PERMISSIONS[role]?.[permission])
}
