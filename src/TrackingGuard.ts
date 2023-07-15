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
  }: ConfigService): ServiceWrapper {
    // console.log(name, label, trackingScriptUrl, handlers)
    const srv = new ServiceWrapper(name, label, onInit)
    for (const [fnName, fn] of Object.entries(handlers))
      srv[fnName] = this._setFnGuard(fn)
    this._services.push(srv)
    return srv
  }

  save(): void {
    const consents = this._services.map((srv: ServiceWrapper) => ({
      srv: srv.n,
      v: this._consents.some((c) => c.srv === srv.n)
        ? this._consents.filter((c) => c.srv === srv.n)[0].v
        : false,
      r: this._consents.some((c) => c.srv === srv.n)
        ? this._consents.filter((c) => c.srv === srv.n)[0].r
        : false,
    }))
    this._consents = consents
    ls.setItem(LS_ITEM_NAME, consents)
  }

  isReviewed(service: string = ''): boolean {
    if (!service) return this._consents.every((consent) => consent.r)
    return !!this._consents.filter(
      (consent) => consent.srv === service && consent.r,
    ).length
  }
  hasConsent(service: string = ''): boolean {
    if (!service) return this._consents.every((consent) => consent.v)
    return !!this._consents.filter(
      (consent) => consent.srv === service && consent.v,
    ).length
  }
}
