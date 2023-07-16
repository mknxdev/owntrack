import { Config, TrackingServiceLayer } from './types'
import TrackingGuard from './TrackingGuard'
import UIProxy from './UIProxy'
import TrackingServiceWrapper from './TrackingServiceWrapper'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _ui: UIProxy = new UIProxy(this._trackingGuard)

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
    this._ui.initSettingsService(services)
    window.addEventListener('DOMContentLoaded', this._onReady.bind(this))
  }
  _onReady() {
    this._ui.mount()
    console.log(this)
  }

  service(name: string) {
    console.log(this)
  }
}
