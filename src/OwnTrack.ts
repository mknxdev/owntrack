import { Config, OTService } from './types'
import TrackingGuard from './TrackingGuard'
import UIManager from './UIManager'
import ServiceWrapper from './ServiceWrapper'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _uiManager: UIManager = new UIManager()
  _services: OTService[] = []

  constructor(config: Config) {
    for (const service of config.services) {
      this._services.push({
        name: service.name,
        srv: this._trackingGuard.wrapService(service),
      })
    }
    this._trackingGuard.save()
    this._uiManager.setTrackingServices(this._services)
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
