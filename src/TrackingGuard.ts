import {
  ConfigService,
  TrackingServiceConsent,
  TrackingServiceContainer,
} from './types'
import ls from './helpers/ls'
import TrackingService from './TrackingService'

type InitTask = {
  srv: string
  handler: Function
  processed: boolean
}
type Task = {
  srv: string
  handler: Function
}

const LS_ITEM_NAME = 'owntrack_uc'

export default class TrackingGuard {
  _services: TrackingService[] = []
  _consents: TrackingServiceConsent[] = []
  _initTaskQueue: InitTask[] = []
  _tasksQueue: Task[] = []
  // rc: required cookies
  _rcService: TrackingServiceContainer = {
    isEditable: false,
    name: '_rc',
    description: 'This website uses some cookies needed for it to work. They cannot be disabled.',
    consent: { value: true, reviewed: true },
    tsw: new TrackingService('_rc', 'Required cookies')
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
  }: ConfigService): TrackingServiceContainer {
    this._initTaskQueue.push({ srv: name, handler: onInit, processed: false })
    const srv = new TrackingService(name, label)
    for (const [fnName, fn] of Object.entries(handlers)) {
      srv[fnName] = this._getWrappedTrackingFn(name, /* fnName, */ fn)
    }
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
  _getWrappedTrackingFn(srv: string, /* handlerName: string, */ handler: Function) {
    return () => {
      if (this.hasConsent(srv)) return handler()
      else if (!this.isReviewed(srv)) this._tasksQueue.push({
        srv,
        handler,
      })
    }
  }
  _execInitTaskQueue(): void {
    this._initTaskQueue = this._initTaskQueue.filter(task => {
      if (this.hasConsent(task.srv) && !task.processed) {
        task.handler()
        task.processed = true
      }
      return task
    })
  }
  _execTasksQueue(): void {
    this._tasksQueue = this._tasksQueue.filter(task => {
      if (!this.isReviewed(task.srv)) return true
      if (this.hasConsent(task.srv)) task.handler()
      return false
    })
  }
  store(): void {
    const consents = this._services.map((srv: TrackingService) => ({
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
  init(): void {
    this._execInitTaskQueue()
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
    this._execInitTaskQueue()
    this._execTasksQueue()
  }
  setUnreviewedConsents(value: boolean): void {
    this._consents = this._consents.map((consent) => {
      if (!consent.r) consent.v = value
      consent.r = true
      return consent
    })
    this.store()
    this._execInitTaskQueue()
    this._execTasksQueue()
  }
  getRCService(): TrackingServiceContainer {
    return this._rcService
  }
  getTrackingServices(): TrackingServiceContainer[] {
    return this._services.map(
      (srv: TrackingService): TrackingServiceContainer => ({
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
