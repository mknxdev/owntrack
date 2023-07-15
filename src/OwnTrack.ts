import { Config } from './types'
import TrackingGuard from './TrackingGuard'
import UIManager from './UIManager'

type Services = object

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _uiManager: UIManager = new UIManager()
  _services: Services = {}

  constructor(config: Config) {
    for (const srv of config.services) {
      this._services[srv.name] = this._trackingGuard.wrapService(srv)
    }
    this._trackingGuard.save()
    this._uiManager.setConsentReviewed(this._trackingGuard.isReviewed())
    console.log(this._uiManager)
  }

  service(name: string) {
    console.log(this)
  }
}
