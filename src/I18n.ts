import { LocaleDefinition, Locales } from './types'

export default class I18n {
  _locales: Locales
  _currentLocale: string

  setLocales(locales: Locales): void {
    this._locales = locales
  }
  setCurrentLocale(locale: string): void {
    this._currentLocale = locale
  }
  getCurrentLocale(): LocaleDefinition {
    return this._locales[this._currentLocale]
  }
  // shortcut for current locale access
  getLocalesIds(): string[] {
    return Object.keys(this._locales)
  }
  _findLocale(key: string, locales?: object): string {
    const l = locales || this.getCurrentLocale()
    const index = key.indexOf('.')
    if (index === -1) return l[key]
    return this._findLocale(key.slice(index + 1), l[key.slice(0, index)])
  }
  // shortcut for current locale access
  t(key: string): string {
    const t = this._findLocale(key)
    return t || key
  }
}
