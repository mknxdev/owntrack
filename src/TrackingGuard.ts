import {
  ConfigService,
  TrackingServiceContainer,
} from './types'
import ls from './helpers/ls'
import { createScriptElmt } from './helpers/ui'
import TrackingService from './TrackingService'
import I18nProxy from './I18nProxy'

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
  _i18n: I18nProxy = undefined
  _services: TrackingServiceContainer[] = []
  _scriptQueue: ScriptTask[] = []
  _initTaskQueue: InitTask[] = []
  _tasksQueue: Task[] = []
  // rc: required cookies
  _rcService: TrackingServiceContainer = undefined

  wrapService({
    name,
    label,
    type,
    description,
    scripts,
    onInit,
    handlers,
    host,
    guard,
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
      for (const [fnName, fn] of Object.entries(handlers))
        srv[fnName] = this._getWrappedTrackingFn(name, fn)
    const serviceContainer: TrackingServiceContainer = {
      isEditable: true,
      name,
      type,
      description,
      consent: {
        value: this.hasConsent(name),
        reviewed: this.isReviewed(name),
      },
      host,
      // guard: this._getComputedServiceGuard(guard),
      guard,
      ts: srv,
    }
    this._services.push(serviceContainer)
    this._retrieveConsentsFromLS()
    return serviceContainer
  }
  _retrieveConsentsFromLS() {
    const consents = ls.getItem(LS_ITEM_NAME) || []
    this._services = this._services.map((s) => {
      s.consent.value = consents.filter((c) => c.srv === s.name)[0]?.v || false
      s.consent.reviewed = consents.filter((c) => c.srv === s.name)[0]?.r || false
      return s
    })
  }
  _getComputedServiceGuard(guard) {
    return guard
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
        const bypass = this._services.some(s => s.name === task.srv && s.guard.bypass)
        const execute = bypass || this.isReviewed(task.srv) && this.hasConsent(task.srv)
        if (
          !task.processed &&
          !task.attachedHandler &&
          execute
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
        const bypass = this._services.some(s => s.name === task.srv && s.guard.bypass)
        const execute = bypass || this.isReviewed(task.srv) && this.hasConsent(task.srv)
        if (
          scriptsLoaded &&
          execute
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
        const bypass = this._services.some(s => s.name === task.srv && s.guard.bypass)
        const execute = bypass || this.isReviewed(task.srv) && this.hasConsent(task.srv)
        if (
          scriptsLoaded &&
          initScriptsFinished &&
          execute
        ) {
          task.handler(...task.args)
          task.processed = true
        }
        return task
      })
      .filter((task) => !task.processed)
  }
  _initServiceGuard(name, guard): void {
    console.log(name, guard, this)
  }
  initI18n(i18n: I18nProxy): void {
    this._i18n = i18n
    this._rcService = {
      isEditable: false,
      name: '_rc',
      description: this._i18n.t('settings.required_cookies.description'),
      consent: { value: true, reviewed: true },
      ts: new TrackingService(
        '_rc',
        this._i18n.t('settings.required_cookies.title'),
      ),
    }
  }
  store(): void {
    const consents = this._services.map((srv: TrackingServiceContainer) => ({
      srv: srv.name,
      v: srv.consent.value,
      r: srv.consent.reviewed
    }))
    ls.setItem(LS_ITEM_NAME, consents)
  }
  initQueues(): void {
    this._execScriptTaskQueue()
    this._execInitTaskQueue()
    this._execTaskQueue()
  }
  setConsent(value: boolean, service = ''): void {
    if (!service)
      for (const srv of this._services) {
        srv.consent.value = value
        srv.consent.reviewed = true
      }
    else
      this._services = this._services.map((srv) => {
        if (srv.name === service) {
          srv.consent.value = value
          srv.consent.reviewed = true
        }
        return srv
      })
    this.store()
    this._execScriptTaskQueue()
    this._execInitTaskQueue()
    this._execTaskQueue()
  }
  setUnreviewedConsents(value: boolean): void {
    this._services = this._services.map((srv) => {
      if (!srv.consent.reviewed) srv.consent.value = value
      srv.consent.reviewed = true
      return srv
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
    return this._services
  }
  isReviewed(service = ''): boolean {
    if (!service) return this._services.every((s) => s.consent.reviewed)
    return !!this._services.filter(
      (s) => s.name === service && s.consent.reviewed,
    ).length
  }
  hasConsent(service = ''): boolean {
    if (!service) return this._services.every((s) => s.consent.value)
    return !!this._services.filter(
      (s) => s.name === service && s.consent.value,
    ).length
  }
  hasGlobalConsent(value: boolean): boolean {
    return this._services.every((s) => s.consent.value === value)
  }
}
