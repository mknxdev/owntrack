import { Config, TrackingServiceContainer } from './types'
import TrackingGuard from './TrackingGuard'
import DOMProxy from './DOMProxy'
import TrackingService from './TrackingService'
import { checkForValidServiceName, fillDefaultValues } from './helpers/pApi'

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _services: TrackingServiceContainer[] = []
  _dp: DOMProxy = new DOMProxy(this._trackingGuard)

  constructor(config: Config) {
    const fmtConfig = Object.assign({}, fillDefaultValues(config))
    for (const service of fmtConfig.services)
      this._services.push(this._trackingGuard.wrapService(service))
    this._trackingGuard.store()
    this._trackingGuard.init()
    let services = []
    if (config.enableRequiredCookies)
      services.push(this._trackingGuard.getRCService())
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
