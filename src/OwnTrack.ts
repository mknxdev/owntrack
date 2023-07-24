import { TrackingServiceContainer, Locales, Config } from './types'
import TrackingGuard from './TrackingGuard'
import I18nProxy from './I18nProxy'
import DOMProxy from './DOMProxy'
import TrackingService from './TrackingService'
import { checkForValidServiceName } from './helpers/pApi'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _services: TrackingServiceContainer[] = []
  _i18n: I18nProxy = new I18nProxy()
  _dp: DOMProxy = new DOMProxy(this._trackingGuard, this._i18n)

  constructor(config: Config) {
    console.log(this)
    // Tracking guard
    for (const service of config.services)
      this._services.push(this._trackingGuard.wrapService(service))
    this._trackingGuard.store()
    this._trackingGuard.init()
    let services = []
    if (config.enableRequiredCookies)
      services.push(this._trackingGuard.getRCService())
    // I18n Proxy
    this._i18n.setLocales(config.locales)
    this._i18n.setCurrentLocale(config.locale)
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
}
