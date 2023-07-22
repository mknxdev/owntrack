export const setItem = (name: string, value: any): void => {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    value = JSON.stringify(value) as string
  }
  localStorage.setItem(name, String(value))
}

export const getItem = (name: string): any => {
  const value = localStorage.getItem(name)
  if (value == null) return null
  if (['true', 'false'].includes(value)) return value === 'true'
  if (!isNaN(Number(value))) return Number(value)
  try {
    return JSON.parse(value)
  } catch (e) {
    /* Nothing to do; continue */
  }
  return String(value)
}

export const removeItem = (name: string) => {
  localStorage.removeItem(name)
}

export default {
  setItem,
  getItem,
  removeItem,
}
