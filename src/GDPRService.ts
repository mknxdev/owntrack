import { TrackingServiceConsent } from './types'
// import { env } from '@/helpers/env'
import ls from './helpers/ls'
// import * as matomo from '@/services/mtm'

// declare global {
//   interface Window {
//     _OT: GDPR
//   }
// }
type TrackingActionItem = {
  service: string
  fnName: string
  fn: Function
  args: any[]
}

const LS_ITEM_NAME = 'udwi.consents'
const ENV_TRACKING_SERVICES = env('VUE_APP_ENABLED_TRACKING_SERVICES') as string
const ENABLED_SERVICES = ENV_TRACKING_SERVICES ? ENV_TRACKING_SERVICES.split(',').map((s) => s.trim()) : []
const TRACKERS_MODULES = {
  matomo,
}

class GDPR {
  _consents: TrackingServiceConsent[] = []
  _pendingActions: TrackingActionItem[] = []

  constructor() {
    const browserConsents: TrackingServiceConsent[] = ls.getItem(LS_ITEM_NAME) || []
    const consents: TrackingServiceConsent[] = [...browserConsents.filter((c) => ENABLED_SERVICES.includes(c.name))]
    ENABLED_SERVICES.forEach((srv) => {
      if (browserConsents.every((s) => s.name !== srv)) consents.push({ name: srv, consent: false, reviewed: false })
    })
    this._consents = consents
    this.save()
  }

  _isServiceEnabled(name: string): boolean {
    return ENABLED_SERVICES.some((s) => s === name)
  }
  _runPendingActions(): void {
    for (const [i, a] of this._pendingActions.entries()) {
      if (this.isReviewed(a.service)) {
        if (this.hasConsent(a.service)) a.fn(...a.args)
        this._pendingActions.splice(i, 1)
      }
    }
  }
  service(name: string): any {
    const service = {}
    const srvModule = TRACKERS_MODULES[name as keyof TRACKERS_MODULES]
    for (const [key, value] of Object.entries(srvModule)) {
      if (typeof value === 'function') {
        service[key as keyof typeof service] = (...args: any): any => {
          if (this._isServiceEnabled(name)) {
            if (!this.isReviewed(name)) this._pendingActions.push({ service: name, fnName: key, fn: value, args })
            else if (this.hasConsent(name)) value(...args)
          }
        }
      }
    }
    return service
  }
  setConsent(value: boolean, service: string): void {
    const existing: TrackingServiceConsent[] = this._consents.filter((s) => s.name === service)
    if (!existing.length) throw new Error(`GDPR: '${service}' service is not enabled.`)
    existing[0].consent = value
    this._runPendingActions()
  }
  setReviewed(value: boolean, service: string): void {
    const existing: TrackingServiceConsent[] = this._consents.filter((s) => s.name === service)
    if (!existing.length) throw new Error(`GDPR: '${service}' service is not enabled.`)
    existing[0].reviewed = value
    this._runPendingActions()
  }
  hasConsent(service: string): boolean {
    if (this._isServiceEnabled(service)) return !!this._consents.filter((c) => c.name === service && c.consent).length
    return true
  }
  isReviewed(service = '') {
    if (!service) return this._consents.every((c) => c.reviewed)
    return !!this._consents.filter((c) => c.name === service && c.reviewed).length
  }
  getConsents(): TrackingServiceConsent[] {
    return this._consents
  }
  save(): void {
    ls.setItem(LS_ITEM_NAME, this._consents)
  }
  loadConsentsFromBrowser(): void {
    this._consents = ls.getItem(LS_ITEM_NAME)
  }
}

// export default () => (window._OT = window._OT || new GDPR())
