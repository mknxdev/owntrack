import { ConfigService, TrackingServiceConsent } from './types'
import ls from './helpers/ls'
import ServiceWrapper from './ServiceWrapper'

const LS_ITEM_NAME = 'owntrack_uc'

export default class TrackingGuard {
  _services: ServiceWrapper[] = []
  _consents: TrackingServiceConsent[] = []

  constructor() {
    this._consents = ls.getItem(LS_ITEM_NAME) || []
  }

  _setFnGuard(handler: Function) {
    return () => {
      return handler()
    }
  }

  wrapService({
    name,
    label,
    trackingScriptUrl,
    onInit,
    handlers,
  }: ConfigService) {
    // console.log(name, label, trackingScriptUrl, handlers)
    const srv = new ServiceWrapper(name, onInit)
    for (const [fnName, fn] of Object.entries(handlers))
      srv[fnName] = this._setFnGuard(fn)
    this._services.push(srv)
    return srv
  }

  save() {
    const consents = this._services.map((s: ServiceWrapper) => ({
      srv: s.name,
      v: this._consents.some((c) => c.srv === s.name)
        ? this._consents.filter((c) => c.srv === s.name)[0].v
        : false,
      r: this._consents.some((c) => c.srv === s.name)
        ? this._consents.filter((c) => c.srv === s.name)[0].r
        : false,
    }))
    ls.setItem(LS_ITEM_NAME, consents)
  }
}
