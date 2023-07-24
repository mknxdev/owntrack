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
  _findLocale(key: string, locales?: object): string {
    const l = locales || this._locales
    const nestings = key.split('.')
    let found = ''
    for (const [k, e] of Object.entries(l)) {
      if (key === k) found = e
    }
    if (!found) {
      nestings.splice(0, 1)
      console.log(nestings);
      
      // nestings.splice(0, 1)
      // found = this._findLocale(nestings.join('.'), l)
    }
    return found
  }
  // shortcut for current locale access
  t(key: string): string {
    const t = this._findLocale(key)
    console.log(t);
    
    return this._locales[this._currentLocale]
  }
}
