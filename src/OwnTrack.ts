import { TrackingServiceContainer, Config } from './types'
import TrackingGuard from './TrackingGuard'
import I18n from './I18n'
import DOMProxy from './DOMProxy'
import TrackingService from './TrackingService'
import { checkForValidServiceName } from './helpers/pApi'

export default class OwnTrack {
  _i18n: I18n = new I18n()
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _services: TrackingServiceContainer[] = []
  _dp: DOMProxy = new DOMProxy(this._trackingGuard, this._i18n)

  constructor(config: Config) {
    // Tracking guard
    for (const service of config.services)
      this._services.push(this._trackingGuard.wrapService(service))
    this._trackingGuard.initRequestInterceptors()
    this._trackingGuard.store()
    this._trackingGuard.initQueues()
    // I18n Proxy
    this._i18n.setLocales(config.locales)
    this._i18n.setCurrentLocale(config.locale)
    this._trackingGuard.initI18n(this._i18n)
    let services = []
    if (config.enableRequiredCookies)
      services.push(this._trackingGuard.getRCService())
    // DOM Proxy
    this._dp.setServices(services.concat(this._services))
    this._dp.init()
    window.addEventListener('DOMContentLoaded', () => {
      this._dp.mount()
    })
  }

  service(name: string): TrackingService {
    if (
      checkForValidServiceName(
        name,
        this._services.map((s) => s.name),
      )
    )
      return this._services.filter((s) => s.name === name)[0].ts
    return
  }

  setLocale(localeId: string): void {
    if (this._i18n.getLocalesIds().includes(localeId)) {
      this._i18n.setCurrentLocale(localeId)
      this._dp.render()
    }
  }
}
