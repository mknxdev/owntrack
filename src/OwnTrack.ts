import { Config, TrackingServiceContainer } from './types'
import TrackingGuard from './TrackingGuard'
import UIProxy from './UIProxy'
import TrackingService from './TrackingService'
import { checkForValidServiceName } from './helpers/init'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _services: TrackingServiceContainer[] = []
  _ui: UIProxy = new UIProxy(this._trackingGuard)

  constructor(config: Config) {
    for (const service of config.services)
      this._services.push(this._trackingGuard.wrapService(service))
    this._trackingGuard.store()
    this._trackingGuard.init()
    this._ui.initSettingsServices([
      this._trackingGuard.getRCService(),
      ...this._services
    ])
    window.addEventListener('DOMContentLoaded', () => {
      this._ui.mount()
    })
  }

  service(name: string): TrackingService {
    if (checkForValidServiceName(name, this._services.map(s => s.name)))
      return this._services.filter(s => s.name === name)[0].tsw
  }
}
