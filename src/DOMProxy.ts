import { TrackingServiceContainer } from './types'
import { createElmt, generateIconElement, getLogoElement } from './helpers/ui'
import {
  findElementChildByAttr as findChildByAttr,
  findElementChildByClass,
} from './helpers/dom'
import TrackingGuard from './TrackingGuard'

export default class DOMProxy {
  _trackingGuard: TrackingGuard
  _services: TrackingServiceContainer[] = []
  // _d: DOM
  // _d.r: root
  // _d.r: entry root
  // _d.sr: settings root
  // _d.sc: settings content
  // _d.srvr: services root
  _d: { r: Element; er: Element; sr: Element; sc: Element; srvr: Element } = {
    r: createElmt('div'),
    er: createElmt('div'),
    sr: createElmt('div'),
    sc: createElmt('div'),
    srvr: createElmt('div'),
  }
  _entryDisplayed = false
  _settingsDisplayed = false

  constructor(trackingGuard: TrackingGuard) {
    this._trackingGuard = trackingGuard
  }
  _initBase(): void {
    this._d.r = document.createElement('div')
    this._d.r.classList.add('ot-root')
  }
  _initEntry(): void {
    this._d.er = createElmt('div', ['ot-entry-wrapper'])
    const elEntry = createElmt('div', ['ot-entry'])
    const elEntryNotice = createElmt('div', ['ot-entry__notice'])
    elEntryNotice.innerHTML =
      '<p>This website uses cookies &amp; analytics for tracking and/or advertising purposes. You can choose to accept them or not.</p>'
    elEntry.append(elEntryNotice)
    const btns = [
      {
        t: 'Settings',
        c: ['otua-settings', 'ot-btn', 'ot-ghost'],
        a: { 'data-ot-entry-ua': 'settings' },
        h: this._onSettingsOpenClick.bind(this),
      },
      {
        t: 'Deny',
        c: ['otua-deny', 'ot-btn'],
        a: { 'data-ot-entry-ua': 'deny' },
        h: this._onEDenyAllServicesClick.bind(this),
      },
      {
        t: 'Allow',
        c: ['otua-allow', 'ot-btn'],
        a: { 'data-ot-entry-ua': 'allow' },
        h: this._onEAllowAllServicesClick.bind(this),
      },
      {
        i: 'close',
        c: ['otua-close', 'ot-btn', 'ot-btn-icn', 'ot-ghost', 'ot-rounded'],
        a: { 'data-ot-entry-ua': 'close' },
        h: this._onMainCloseClick.bind(this),
      },
    ]
    const elEntryBtns = createElmt('div', ['ot-entry__btns'])
    for (const btn of btns) {
      let elEntryBtn: Element
      if (btn.t) {
        elEntryBtn = createElmt('button', btn.c, btn.a)
        elEntryBtn.innerHTML = btn.t
      } else if (btn.i) {
        elEntryBtn = createElmt('div', btn.c, btn.a)
        elEntryBtn.append(generateIconElement('close'))
      }
      elEntryBtn.addEventListener('click', btn.h)
      elEntryBtns.append(elEntryBtn)
    }
    elEntry.append(elEntryBtns)
    this._d.er.append(elEntry)
    // this._d.r.append(this._d.er)
  }
  _initSettingsBase(): void {
    this._d.sr.classList.add('ot-settings-overlay')
    this._d.sc.classList.add('ot-settings')
  }
  _initSettingsHeader(): void {
    // "close" btn
    const elCloseBtn = createElmt('div', [
      'ot-settings__close',
      'ot-btn',
      'ot-btn-icn',
      'ot-ghost',
      'ot-rounded',
    ])
    elCloseBtn.addEventListener('click', this._onSettingsCloseClick.bind(this))
    const elClose = generateIconElement('close')
    elCloseBtn.append(elClose)
    const elHeadline = createElmt('h1')
    elHeadline.innerHTML = 'Tracking Settings'
    const elNotice = createElmt('p', ['ot-settings__notice'])
    elNotice.innerHTML =
      'Here you can manage tracking/analytics acceptance for each service.<br/> You can also accept or deny tracking for all services at once.'
    const elGActions = createElmt('div', ['ot-settings__main-actions'])
    const btns = [
      {
        t: 'Deny all',
        c: ['otua-deny', 'ot-btn', 'otua-deny'],
        a: { 'data-ot-settings-ua': 'deny' },
        h: this._onSDenyAllServicesClick.bind(this),
      },
      {
        t: 'Allow all',
        c: ['otua-allow', 'ot-btn', 'otua-allow'],
        a: { 'data-ot-settings-ua': 'allow' },
        h: this._onSAllowAllServicesClick.bind(this),
      },
    ]
    const elGActionsBtns = createElmt('div', [
      'ot-settings__main-actions__btns',
    ])
    for (const btn of btns) {
      const elEntryBtn = createElmt('button', btn.c, btn.a)
      elEntryBtn.innerHTML = btn.t
      elEntryBtn.addEventListener('click', btn.h)
      elGActionsBtns.append(elEntryBtn)
    }
    elGActions.append(elGActionsBtns)
    this._d.sc.append(elCloseBtn)
    this._d.sc.append(elHeadline)
    this._d.sc.append(elNotice)
    this._d.sc.append(elGActions)
  }
  _initSettingsServices(): void {
    this._d.srvr.classList.add('ot-settings__services')
    for (const service of this._services) {
      const elSrv = createElmt('div', ['ot-settings__service'], {
        'data-ot-srv': service.name,
      })
      const elSrvHeader = createElmt('div', ['ot-settings__service-header'])
      const elSrvName = createElmt('p', ['ot-settings__service-name'])
      const elSrvContent = createElmt('div', ['ot-settings__service-content'])
      const elSrvInfo = createElmt('div', ['ot-settings__service-info'])
      let elSrvType: Element
      if (service.type) {
        elSrvType = createElmt('p', ['ot-settings__service-type'])
        elSrvType.innerHTML = service.type
      }
      elSrvName.innerHTML = service.ts.label
      elSrvHeader.append(elSrvName)
      if (elSrvType) elSrvHeader.append(elSrvType)
      let elSrvDesc: Element
      if (service.description) {
        elSrvDesc = createElmt('div', ['ot-settings__service-desc'])
        elSrvDesc.innerHTML = service.description
      }
      let elSrvState: Element
      if (service.isEditable)
        elSrvState = createElmt('div', ['ot-settings__service-state'], {
          'data-ot-srv-state': '',
        })
      if (elSrvDesc) elSrvInfo.append(elSrvDesc)
      if (elSrvState) elSrvInfo.append(elSrvState)
      let elSrvBtns: Element
      if (service.isEditable) {
        elSrvBtns = createElmt('div', ['ot-settings__service-btns'])
        const btns = [
          {
            t: 'Deny',
            c: ['otua-deny', 'ot-btn', 'ot-btn-sm'],
            a: { 'data-ot-settings-srv-ua': 'deny' },
            h: this._onDenyServiceClick.bind(this),
          },
          {
            t: 'Allow',
            c: ['otua-allow', 'ot-btn', 'ot-btn-sm'],
            a: { 'data-ot-settings-srv-ua': 'allow' },
            h: this._onAllowServiceClick.bind(this),
          },
        ]
        for (const btn of btns) {
          const elServiceBtn = createElmt('button', btn.c, btn.a)
          elServiceBtn.innerHTML = btn.t
          elServiceBtn.addEventListener('click', (e) => btn.h(service.name, e))
          elSrvBtns.append(elServiceBtn)
        }
      }
      elSrvContent.append(elSrvInfo)
      if (elSrvBtns) elSrvContent.append(elSrvBtns)
      elSrv.append(elSrvHeader)
      elSrv.append(elSrvContent)
      this._d.srvr.append(elSrv)
    }
    this._d.sc.append(this._d.srvr)
  }
  _initSettingsFooter(): void {
    const elEntryCP = createElmt('div', ['ot-settings__cp'])
    const elEntryCPInfo = createElmt('div', ['ot-settings__cp-info'])
    elEntryCPInfo.innerHTML = 'Powered by OwnTrack'
    const elEntryCPLogo = createElmt('div', ['ot-settings__cp-logo'])
    elEntryCPLogo.append(getLogoElement())
    elEntryCP.append(elEntryCPInfo)
    elEntryCP.append(elEntryCPLogo)
    this._d.sc.append(elEntryCP)
  }
  _render(): void {
    // base
    if (this._entryDisplayed) {
      this._d.r.append(this._d.er)
    } else {
      this._d.er.remove()
    }
    if (this._settingsDisplayed) {
      this._d.sr.append(this._d.sc)
      this._d.r.append(this._d.sr)
    } else {
      this._d.sr.remove()
    }
    // entry + settings
    const elBtnESettings = findChildByAttr(
      this._d.r,
      'data-ot-entry-ua',
      'settings',
    )
    if (elBtnESettings) {
      if (this._settingsDisplayed) elBtnESettings.classList.add('ot-active')
      else elBtnESettings.classList.remove('ot-active')
    }
    const elBtnEDenyAll = findChildByAttr(this._d.r, 'data-ot-entry-ua', 'deny')
    const elBtnEAllowAll = findChildByAttr(
      this._d.r,
      'data-ot-entry-ua',
      'allow',
    )
    const elBtnSDenyAll = findChildByAttr(
      this._d.sr,
      'data-ot-settings-ua',
      'deny',
    )
    const elBtnSAllowAll = findChildByAttr(
      this._d.sr,
      'data-ot-settings-ua',
      'allow',
    )
    elBtnEDenyAll?.classList.remove('ot-active')
    elBtnEAllowAll?.classList.remove('ot-active')
    elBtnSDenyAll?.classList.remove('ot-active')
    elBtnSAllowAll?.classList.remove('ot-active')
    if (this._trackingGuard.isReviewed()) {
      if (this._trackingGuard.hasGlobalConsent(false)) {
        elBtnEDenyAll?.classList.add('ot-active')
        elBtnSDenyAll?.classList.add('ot-active')
      } else if (this._trackingGuard.hasGlobalConsent(true)) {
        elBtnEAllowAll?.classList.add('ot-active')
        elBtnSAllowAll?.classList.add('ot-active')
      }
    }
    // settings:services
    for (const srv of this._services) {
      const elSrv: Element = findChildByAttr(
        this._d.srvr,
        'data-ot-srv',
        srv.name,
      )
      if (elSrv) {
        const elState = findChildByAttr(elSrv, 'data-ot-srv-state')
        if (elState) elState.innerHTML = this._getServiceStateLabel(srv)
        const elBtnDeny = findChildByAttr(
          elSrv,
          'data-ot-settings-srv-ua',
          'deny',
        )
        const elBtnAllow = findChildByAttr(
          elSrv,
          'data-ot-settings-srv-ua',
          'allow',
        )
        elBtnDeny?.classList.remove('ot-active')
        if (srv.consent.reviewed && !srv.consent.value)
          elBtnDeny?.classList.add('ot-active')
        elBtnAllow?.classList.remove('ot-active')
        if (srv.consent.reviewed && srv.consent.value)
          elBtnAllow?.classList.add('ot-active')
      }
    }
  }
  _onMainCloseClick(): void {
    this._trackingGuard.setUnreviewedConsents(false)
    this._services = this._trackingGuard.getTrackingServices()
    this._entryDisplayed = false
    this._settingsDisplayed = false
    this._render()
  }
  _onSettingsOpenClick(): void {
    this._settingsDisplayed = true
    this._render()
  }
  _onSettingsCloseClick(): void {
    this._settingsDisplayed = false
    this._entryDisplayed = !this._trackingGuard.isReviewed()
    this._render()
  }
  _onEAllowAllServicesClick(): void {
    this._trackingGuard.setConsent(true)
    this.setEntryState(false)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onEDenyAllServicesClick(): void {
    this._trackingGuard.setConsent(false)
    this.setEntryState(false)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onSAllowAllServicesClick(): void {
    this._trackingGuard.setConsent(true)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onSDenyAllServicesClick(): void {
    this._trackingGuard.setConsent(false)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onAllowServiceClick(service: string): void {
    this._trackingGuard.setConsent(true, service)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onDenyServiceClick(service: string): void {
    this._trackingGuard.setConsent(false, service)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _getServiceStateLabel(srv: TrackingServiceContainer): string {
    if (!srv.consent.reviewed) return 'Pending'
    if (srv.consent.value) return 'Allowed'
    return 'Denied'
  }
  setEntryState(value: boolean): void {
    this._entryDisplayed = value
  }
  mount(): void {
    this._render()
    document.body.append(this._d.r)
  }
  setServices(services: TrackingServiceContainer[]): void {
    this._services = services
  }
  init(): void {
    this._initBase()
    this._initEntry()
    this._initSettingsBase()
    this._initSettingsHeader()
    this._initSettingsServices()
    this._initSettingsFooter()
  }
}
