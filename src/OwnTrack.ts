import { Config, TrackingServiceLayer } from './types'
import TrackingGuard from './TrackingGuard'
import UIManager from './UIManager'
import TrackingServiceWrapper from './TrackingServiceWrapper'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _uiManager: UIManager = new UIManager(this._trackingGuard)

  constructor(config: Config) {
    const serviceWrappers: TrackingServiceWrapper[] = []
    for (const service of config.services)
      serviceWrappers.push(this._trackingGuard.wrapService(service))
    this._trackingGuard.store()
    const services: TrackingServiceLayer[] = serviceWrappers.map((sw) => ({
      name: sw.name,
      consent: {
        value: this._trackingGuard.hasConsent(sw.name),
        reviewed: this._trackingGuard.isReviewed(sw.name),
      },
      sw,
    }))
    this._uiManager.initSettingsService(services)
    this._uiManager.setConsentReviewed(this._trackingGuard.isReviewed())
    window.addEventListener('DOMContentLoaded', this._onReady.bind(this))
  }
  _onReady() {
    this._uiManager.mount()
    console.log(this)
  }

  service(name: string) {
    console.log(this)
  }
}
