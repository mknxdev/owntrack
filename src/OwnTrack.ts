import { Config, OTService } from './types'
import TrackingGuard from './TrackingGuard'
import UIManager from './UIManager'
import ServiceWrapper from './ServiceWrapper'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _uiManager: UIManager = new UIManager()
  _services: OTService[] = []

  constructor(config: Config) {
    const serviceWrappers: ServiceWrapper[] = []
    for (const service of config.services)
      serviceWrappers.push(this._trackingGuard.wrapService(service))
    this._trackingGuard.save()
    this._services = serviceWrappers.map((sw) => ({
      name: sw.n,
      consent: {
        value: this._trackingGuard.hasConsent(sw.n),
        reviewed: this._trackingGuard.isReviewed(sw.n),
      },
      sw,
    }))
    console.log(this._services)
    this._uiManager.initSettingsService(this._services)
    this._uiManager.setConsentReviewed(this._trackingGuard.isReviewed())
    window.addEventListener('DOMContentLoaded', this._onReady.bind(this))
  }
  _onReady() {
    this._uiManager.mount()
  }

  service(name: string) {
    console.log(this)
  }
}
