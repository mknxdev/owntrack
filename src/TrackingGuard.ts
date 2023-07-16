import { ConfigService, TrackingServiceConsent, TrackingService } from './types'
import ls from './helpers/ls'
import TrackingServiceWrapper from './TrackingServiceWrapper'

const LS_ITEM_NAME = 'owntrack_uc'

export default class TrackingGuard {
  _services: TrackingServiceWrapper[] = []
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
  }: ConfigService): TrackingServiceWrapper {
    // console.log(name, label, trackingScriptUrl, handlers)
    const srv = new TrackingServiceWrapper(name, label, onInit)
    for (const [fnName, fn] of Object.entries(handlers))
      srv[fnName] = this._setFnGuard(fn)
    this._services.push(srv)
    return srv
  }
  store(): void {
    const consents = this._services.map((srv: TrackingServiceWrapper) => ({
      srv: srv.name,
      v: this._consents.some((c) => c.srv === srv.name)
        ? this._consents.filter((c) => c.srv === srv.name)[0].v
        : false,
      r: this._consents.some((c) => c.srv === srv.name)
        ? this._consents.filter((c) => c.srv === srv.name)[0].r
        : false,
    }))
    this._consents = consents
    ls.setItem(LS_ITEM_NAME, consents)
  }
  updateConsent(value: boolean, service = ''): void {
    if (!service)
      for (const consent of this._consents) {
        consent.v = value
        consent.r = true
      }
    else
      this._consents = this._consents.map((consent) => {
        if (consent.srv === service) {
          consent.v = value
          consent.r = true
        }
        return consent
      })
    this.store()
  }
  getTrackingServices(): TrackingService[] {
    return this._services.map(
      (srv: TrackingServiceWrapper): TrackingService => ({
        name: srv.name,
        consent: {
          value: this._consents.some((c) => c.srv === srv.name)
            ? this._consents.filter((c) => c.srv === srv.name)[0].v
            : false,
          reviewed: this._consents.some((c) => c.srv === srv.name)
            ? this._consents.filter((c) => c.srv === srv.name)[0].r
            : false,
        },
        sw: srv,
      }),
    )
  }
  isReviewed(service = ''): boolean {
    if (!service) return this._consents.every((consent) => consent.r)
    return !!this._consents.filter(
      (consent) => consent.srv === service && consent.r,
    ).length
  }
  hasConsent(service = ''): boolean {
    if (!service) return this._consents.every((consent) => consent.v)
    return !!this._consents.filter(
      (consent) => consent.srv === service && consent.v,
    ).length
  }
}
