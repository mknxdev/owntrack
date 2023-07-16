import { TrackingService } from './types'
import { createElmt, generateIconElement } from './helpers/ui'
import { findElementChildByAttr } from './helpers/dom'
import TrackingGuard from './TrackingGuard'

export default class UIManager {
  _trackingGuard: TrackingGuard
  _services: TrackingService[] = []
  _isConsentReviewed = false
  // _d: DOM
  // _d.r: root
  // _d.sr: settings root
  // _d.srvr: services root
  _d: { r: Element; sr: Element; srvr: Element } = {
    r: createElmt('div'),
    sr: createElmt('div'),
    srvr: createElmt('div'),
  }

  constructor(trackingGuard: TrackingGuard) {
    this._trackingGuard = trackingGuard
    this._initBase()
    this._initEntry()
    this._initSettings()
    this._initServices()
  }

  _initBase(): void {
    this._d.r = document.createElement('div')
    this._d.r.classList.add('ot-root')
  }
  _initEntry(): void {
    const elEntryWrapper = createElmt('div', ['ot-entry-wrapper'])
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
        h: this._onOpenSettingsClick.bind(this),
      },
      {
        t: 'Deny',
        c: ['otua-deny', 'ot-btn'],
        a: { 'data-ot-entry-ua': 'deny' },
        h: this._onDenyAllClick.bind(this),
      },
      {
        t: 'Allow',
        c: ['otua-allow', 'ot-btn'],
        a: { 'data-ot-entry-ua': 'allow' },
        h: this._onAllowAllClick.bind(this),
      },
    ]
    const elEntryBtns = createElmt('div', ['ot-entry__btns'])
    for (const btn of btns) {
      const elEntryBtn = createElmt('button', btn.c, btn.a)
      elEntryBtn.innerHTML = btn.t
      elEntryBtn.addEventListener('click', btn.h)
      elEntryBtns.append(elEntryBtn)
    }
    elEntry.append(elEntryBtns)
    elEntryWrapper.append(elEntry)
    this._d.r.append(elEntryWrapper)
  }
  _initSettings(): void {
    this._d.sr.classList.add('ot-settings-overlay')
    const elSettings = createElmt('div', ['ot-settings'])
    // "close" btn
    const elCloseBtn = createElmt('div', ['ot-settings__close'])
    elCloseBtn.addEventListener('click', this._onCloseSettingsClick.bind(this))
    const elClose = generateIconElement('close')
    elClose.classList.add('ot-icn')
    elCloseBtn.append(elClose)
    elSettings.append(elCloseBtn)
    this._d.sr.append(elSettings)
    // content
    let content: Element
    for (let i = 0; i < this._d.sr.children.length; i++)
      if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
        content = this._d.sr.children.item(Number(i))
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
        h: this._onDenyAllClick.bind(this),
      },
      {
        t: 'Allow all',
        c: ['otua-allow', 'ot-btn', 'otua-allow'],
        a: { 'data-ot-settings-ua': 'allow' },
        h: this._onAllowAllClick.bind(this),
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
    content.append(elHeadline)
    content.append(elNotice)
    content.append(elGActions)
  }
  _initServices(): void {
    this._d.srvr.classList.add('ot-settings__services')
  }
  _render(): void {
    // entry + settings
    const elBtnEntryDenyAll = findElementChildByAttr(
      this._d.r,
      'data-ot-entry-ua',
      'deny',
    )
    const elBtnEntryAllowAll = findElementChildByAttr(
      this._d.r,
      'data-ot-entry-ua',
      'allow',
    )
    const elBtnSettingsDenyAll = findElementChildByAttr(
      this._d.sr,
      'data-ot-settings-ua',
      'deny',
    )
    const elBtnSettingsAllowAll = findElementChildByAttr(
      this._d.sr,
      'data-ot-settings-ua',
      'allow',
    )
    elBtnEntryDenyAll.classList.remove('ot-active')
    elBtnEntryAllowAll.classList.remove('ot-active')
    elBtnSettingsDenyAll.classList.remove('ot-active')
    elBtnSettingsAllowAll.classList.remove('ot-active')
    if (this._trackingGuard.isReviewed()) {
      if (this._trackingGuard.hasGlobalConsent(false)) {
        elBtnEntryDenyAll.classList.add('ot-active')
        elBtnSettingsDenyAll.classList.add('ot-active')
      } else if (this._trackingGuard.hasGlobalConsent(true)) {
        elBtnEntryAllowAll.classList.add('ot-active')
        elBtnSettingsAllowAll.classList.add('ot-active')
      }
    }
    // settings:services
    for (const srv of this._services) {
      const elSrv: Element = findElementChildByAttr(
        this._d.srvr,
        'data-ot-srv',
        srv.name,
      )
      if (elSrv) {
        const elState = findElementChildByAttr(elSrv, 'data-ot-srv-state')
        elState.innerHTML = this._getServiceStateLabel(srv)
        const elBtnDeny = findElementChildByAttr(
          elSrv,
          'data-ot-settings-srv-ua',
          'deny',
        )
        const elBtnAllow = findElementChildByAttr(
          elSrv,
          'data-ot-settings-srv-ua',
          'allow',
        )
        elBtnDeny.classList.remove('ot-active')
        elBtnAllow.classList.remove('ot-active')
        if (srv.consent.reviewed) {
          if (!srv.consent.value) elBtnDeny.classList.add('ot-active')
          else elBtnAllow.classList.add('ot-active')
        }
      }
    }
  }
  _onOpenSettingsClick(): void {
    for (let i = 0; i < this._d.r.children.length; i++)
      if (
        !this._d.r.children
          .item(Number(i))
          .classList.contains('ot-settings-overlay')
      )
        this._d.r.append(this._d.sr)
  }
  _onCloseSettingsClick(): void {
    for (let i = 0; i < this._d.r.children.length; i++)
      if (
        this._d.r.children
          .item(Number(i))
          .classList.contains('ot-settings-overlay')
      )
        this._d.sr.remove()
  }
  _onAllowAllClick(): void {
    this._trackingGuard.updateConsent(true)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onDenyAllClick(): void {
    this._trackingGuard.updateConsent(false)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onAllowServiceClick(service: string): void {
    this._trackingGuard.updateConsent(true, service)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }
  _onDenyServicelClick(service: string): void {
    this._trackingGuard.updateConsent(false, service)
    this._services = this._trackingGuard.getTrackingServices()
    this._render()
  }

  mount(): void {
    this._render()
    let settings: Element
    for (let i = 0; i < this._d.sr.children.length; i++)
      if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
        settings = this._d.sr.children.item(Number(i))
    settings.append(this._d.srvr)
    this._d.r.append(this._d.sr)
    document.body.append(this._d.r)
  }
  _getServiceStateLabel(srv: TrackingService): string {
    console.log(srv)

    if (!srv.consent.reviewed) return 'Pending'
    if (srv.consent.value) return 'Allowed'
    return 'Denied'
  }
  initSettingsService(services: TrackingService[]): void {
    this._services = services
    for (const service of services) {
      const elSrv = createElmt('div', ['ot-settings__service'], {
        'data-ot-srv': service.name,
      })
      const elSrvHeader = createElmt('div', ['ot-settings__service-header'])
      const elSrvName = createElmt('p', ['ot-settings__service-name'])
      const elSrvType = createElmt('p', ['ot-settings__service-type'])
      elSrvName.innerHTML = service.sw.label
      elSrvType.innerHTML = 'Tracking Measurement'
      elSrvHeader.append(elSrvName)
      elSrvHeader.append(elSrvType)
      const elSrvContent = createElmt('div', ['ot-settings__service-content'])
      const elSrvInfo = createElmt('div', ['ot-settings__service-info'])
      const elSrvState = createElmt('div', ['ot-settings__service-state'], {
        'data-ot-srv-state': '',
      })
      elSrvInfo.append(elSrvState)
      const elSrvBtns = createElmt('div', ['ot-settings__service-btns'])
      const btns = [
        {
          t: 'Deny',
          c: ['otua-deny', 'ot-btn', 'ot-btn-sm'],
          a: { 'data-ot-settings-srv-ua': 'deny' },
          h: this._onDenyServicelClick.bind(this),
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
      elSrvContent.append(elSrvInfo)
      elSrvContent.append(elSrvBtns)
      elSrv.append(elSrvHeader)
      elSrv.append(elSrvContent)
      this._d.srvr.append(elSrv)
    }
  }
  setConsentReviewed(value: boolean): void {
    this._isConsentReviewed = value
  }
}
