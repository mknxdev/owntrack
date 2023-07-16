import {
  ConfigService,
  TrackingServiceConsent,
  TrackingServiceLayer,
} from './types'
import ls from './helpers/ls'
import TrackingServiceWrapper from './TrackingServiceWrapper'

type Action = {
  srv: string
  handler: Function
  processed: boolean
}

const LS_ITEM_NAME = 'owntrack_uc'

export default class TrackingGuard {
  _services: TrackingServiceWrapper[] = []
  _consents: TrackingServiceConsent[] = []
  _actionsQueue: Action[] = []
  // rc: required cookies
  _rcService: TrackingServiceLayer = {
    isEditable: false,
    name: '_rc',
    description: 'This website uses some cookies needed for it to work. They cannot be disabled.',
    consent: { value: true, reviewed: true },
    tsw: new TrackingServiceWrapper('_rc', 'Required cookies', () => {})
  }

  constructor() {
    this._consents = ls.getItem(LS_ITEM_NAME) || []
  }
  wrapService({
    name,
    label,
    type,
    description,
    trackingScriptUrl,
    onInit,
    handlers,
  }: ConfigService): TrackingServiceLayer {
    // console.log(name, label, trackingScriptUrl, handlers)
    const srv = new TrackingServiceWrapper(name, label, onInit)
    for (const [fnName, fn] of Object.entries(handlers))
      srv[fnName] = this._setFnGuard(name, fn)
    this._services.push(srv)
    return {
      isEditable: true,
      name,
      type,
      description,
      consent: { value: this.hasConsent(name), reviewed: this.isReviewed(name) },
      tsw: srv,
    }
  }
  _setFnGuard(srv: string, handler: Function) {
    return () => {
      if (this.hasConsent(srv)) return handler()
      else if (!this.isReviewed(srv)) this._actionsQueue.push({ srv, handler, processed: false })
    }
  }
  _processActionsQueue() {
    this._actionsQueue = this._actionsQueue.filter(action => {
      if (!this.isReviewed(action.srv)) return true
      if (this.hasConsent(action.srv)) action.handler()
      return false
    })
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
  setConsent(value: boolean, service = ''): void {
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
    this._processActionsQueue()
  }
  setUnreviewedConsents(value: boolean): void {
    this._consents = this._consents.map((consent) => {
      if (!consent.r) consent.v = value
      consent.r = true
      return consent
    })
    this.store()
    this._processActionsQueue()
  }
  getRCService(): TrackingServiceLayer {
    return this._rcService
  }
  getTrackingServices(): TrackingServiceLayer[] {
    return this._services.map(
      (srv: TrackingServiceWrapper): TrackingServiceLayer => ({
        isEditable: true,
        name: srv.name,
        consent: {
          value: this._consents.some((c) => c.srv === srv.name)
            ? this._consents.filter((c) => c.srv === srv.name)[0].v
            : false,
          reviewed: this._consents.some((c) => c.srv === srv.name)
            ? this._consents.filter((c) => c.srv === srv.name)[0].r
            : false,
        },
        tsw: srv,
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
  hasGlobalConsent(value: boolean): boolean {
    return this._consents.every((c) => c.v === value)
  }
}
