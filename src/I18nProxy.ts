import { LocaleDefinition, Locales } from './types'

export default class I18nProxy {
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
  // shortcut for current locale access
  get l(): LocaleDefinition {
    return this._locales[this._currentLocale]
  }
}
