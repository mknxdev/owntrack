import {
  ConfigService,
  TrackingServiceConsent,
  TrackingServiceContainer,
} from './types'
import ls from './helpers/ls'
import { createScriptElmt } from './helpers/ui'
import TrackingService from './TrackingService'

type ScriptTask = {
  srv: string
  url: string
  processed: boolean
  attachedHandler: boolean
}
type InitTask = {
  srv: string
  handler: Function
  processed: boolean
}
type Task = {
  srv: string
  handler: Function
  args: unknown[]
  processed: boolean
}

const LS_ITEM_NAME = 'owntrack_uc'

export default class TrackingGuard {
  _services: TrackingService[] = []
  _consents: TrackingServiceConsent[] = []
  _scriptQueue: ScriptTask[] = []
  _initTaskQueue: InitTask[] = []
  _tasksQueue: Task[] = []
  // rc: required cookies
  _rcService: TrackingServiceContainer = {
    isEditable: false,
    name: '_rc',
    description:
      'This website uses some cookies needed for it to work. They cannot be disabled.',
    consent: { value: true, reviewed: true },
    ts: new TrackingService('_rc', 'Required cookies'),
  }

  constructor() {
    this._consents = ls.getItem(LS_ITEM_NAME) || []
  }
  wrapService({
    name,
    label,
    type,
    description,
    scripts,
    onInit,
    handlers,
  }: ConfigService): TrackingServiceContainer {
    if (scripts)
      for (const script of scripts)
        this._scriptQueue.push({
          srv: name,
          url: script.url,
          processed: false,
          attachedHandler: false,
        })
    if (onInit)
      this._initTaskQueue.push({ srv: name, handler: onInit, processed: false })
    const srv = new TrackingService(name, label)
    if (handlers)
      for (const [fnName, fn] of Object.entries(handlers)) {
        srv[fnName] = this._getWrappedTrackingFn(name, fn)
      }
    this._services.push(srv)
    return {
      isEditable: true,
      name,
      type,
      description,
      consent: {
        value: this.hasConsent(name),
        reviewed: this.isReviewed(name),
      },
      ts: srv,
    }
  }
  _getWrappedTrackingFn(srv: string, handler: Function) {
    return (...args: unknown[]) => {
      this._tasksQueue.push({
        srv,
        handler,
        args,
        processed: false,
      })
      this._execTaskQueue()
    }
  }
  _execScriptTaskQueue(): void {
    this._scriptQueue = this._scriptQueue
      .map((task) => {
        if (
          !task.processed &&
          !task.attachedHandler &&
          this.isReviewed(task.srv) &&
          this.hasConsent(task.srv)
        ) {
          const elScript = createScriptElmt(task.url)
          elScript.addEventListener('load', () => {
            task.processed = true
            this._execScriptTaskQueue()
            this._execInitTaskQueue()
            this._execTaskQueue()
          })
          document.head.append(elScript)
          task.attachedHandler = true
        }
        return task
      })
      .filter((task) => !task.processed)
  }
  _execInitTaskQueue(): void {
    this._initTaskQueue = this._initTaskQueue
      .map((task) => {
        const scriptsLoaded = this._scriptQueue.some((s) => s.srv === task.srv)
          ? this._scriptQueue
              .filter((s) => s.srv === task.srv)
              .every((s) => s.processed)
          : true
        if (
          scriptsLoaded &&
          this.isReviewed(task.srv) &&
          this.hasConsent(task.srv)
        ) {
          task.handler()
          task.processed = true
          this._execTaskQueue()
        }
        return task
      })
      .filter((task) => !task.processed)
  }
  _execTaskQueue(): void {
    this._tasksQueue = this._tasksQueue
      .map((task) => {
        const scriptsLoaded = this._scriptQueue.some((s) => s.srv === task.srv)
          ? this._scriptQueue
              .filter((s) => s.srv === task.srv)
              .every((s) => s.processed)
          : true
        const initScriptsFinished = this._initTaskQueue.some(
          (s) => s.srv === task.srv,
        )
          ? this._initTaskQueue
              .filter((s) => s.srv === task.srv)
              .every((s) => s.processed)
          : true
        if (
          scriptsLoaded &&
          initScriptsFinished &&
          this.isReviewed(task.srv) &&
          this.hasConsent(task.srv)
        ) {
          task.handler(...task.args)
          task.processed = true
        }
        return task
      })
      .filter((task) => !task.processed)
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
    this._execScriptTaskQueue()
    this._execInitTaskQueue()
    this._execTaskQueue()
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
    this._execScriptTaskQueue()
    this._execInitTaskQueue()
    this._execTaskQueue()
  }
  setUnreviewedConsents(value: boolean): void {
    this._consents = this._consents.map((consent) => {
      if (!consent.r) consent.v = value
      consent.r = true
      return consent
    })
    this.store()
    this._execScriptTaskQueue()
    this._execInitTaskQueue()
    this._execTaskQueue()
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
        ts: srv,
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
