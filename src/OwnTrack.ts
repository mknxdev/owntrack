import { Config } from './types'
import TrackingGuard from './TrackingGuard'
import ServiceWrapper from './ServiceWrapper'

type Services = Object

export default class OwnTrack {
  _trackingGuard: TrackingGuard = new TrackingGuard()
  _services: Services = {}

  constructor(config: Config) {
    for (const srv of config.services) {
      this._services[srv.name] = this._trackingGuard.wrapService(srv)
    }
    this._trackingGuard.save()
  }

  service(name: string) {
    console.log(this._services)
  }
}
