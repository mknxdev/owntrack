import { TrackingServiceContainer } from './types'
import { createElmt, generateIconElement, getLogoElement } from './helpers/ui'
import { findElementChildByAttr as findChildByAttr } from './helpers/dom'
import TrackingGuard from './TrackingGuard'
import I18nProxy from './I18nProxy'

export default class DOMProxy {
  _trackingGuard: TrackingGuard
  _i18n: I18nProxy
  _localized: { el: Element; l: string }[] = []
  _services: TrackingServiceContainer[] = []
  _triggerDisplayed = false
  _manualOpen = false
  _entryDisplayed = false
  _settingsDisplayed = false
  _d: {
    r: Element
    tr: Element
    er: Element
    sr: Element
    sc: Element
    srvr: Element
  } = {
    r: createElmt('div'), // root
    tr: createElmt('div'), // trigger root
    er: createElmt('div'), // entry root
    sr: createElmt('div'), // settings root
    sc: createElmt('div'), // settings content
    srvr: createElmt('div'), // services root
  }

  constructor(trackingGuard: TrackingGuard, i18n: I18nProxy) {
    this._trackingGuard = trackingGuard
    this._i18n = i18n
  }
  _initBase(): void {
    this._d.r = document.createElement('div')
    this._d.r.classList.add('ot-root')
  }
  _initTrigger(): void {
    const elTriggerContainer = createElmt('div', ['ot-trigger'])
    const elTriggerInfo = createElmt('p', ['ot-trigger__info'])
    this._localized.push({ el: elTriggerInfo, l: 'headline' })
    elTriggerContainer.append(getLogoElement())
    elTriggerContainer.append(elTriggerInfo)
    this._d.tr.classList.add('ot-trigger-container')
    this._d.tr.append(elTriggerContainer)
    this._d.tr.addEventListener('click', this._onMainTriggerClick.bind(this))
  }
  _initEntry(): void {
    this._d.er = createElmt('div', ['ot-entry-wrapper'])
    const elEntry = createElmt('div', ['ot-entry'])
    const elEntryNotice = createElmt('div', ['ot-entry__notice'])
    const elEntryNoticeP = createElmt('p')
    this._localized.push({ el: elEntryNoticeP, l: 'entry.notice' })
    elEntryNotice.append(elEntryNoticeP)
    elEntry.append(elEntryNotice)
    const btns = [
      {
        l: 'buttons.settings',
        c: ['otua-settings', 'ot-btn', 'ot-ghost'],
        a: { 'data-ot-entry-ua': 'settings' },
        h: this._onSettingsOpenClick.bind(this),
      },
      {
        l: 'buttons.deny',
        c: ['otua-deny', 'ot-btn'],
        a: { 'data-ot-entry-ua': 'deny' },
        h: this._onEDenyAllServicesClick.bind(this),
      },
      {
        l: 'buttons.allow',
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
      if (btn.l) {
        elEntryBtn = createElmt('button', btn.c, btn.a)
        this._localized.push({ el: elEntryBtn, l: btn.l })
      } else if (btn.i) {
        elEntryBtn = createElmt('div', btn.c, btn.a)
        elEntryBtn.append(generateIconElement('close'))
      }
      elEntryBtn.addEventListener('click', btn.h)
      elEntryBtns.append(elEntryBtn)
    }
    elEntry.append(elEntryBtns)
    this._d.er.append(elEntry)
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
    this._localized.push({ el: elHeadline, l: 'settings.title' })
    const elNotice = createElmt('p', ['ot-settings__notice'])
    this._localized.push({ el: elNotice, l: 'settings.notice' })
    const elGActions = createElmt('div', ['ot-settings__main-actions'])
    const btns = [
      {
        l: 'buttons.global_deny',
        c: ['otua-deny', 'ot-btn', 'otua-deny'],
        a: { 'data-ot-settings-ua': 'deny' },
        h: this._onSDenyAllServicesClick.bind(this),
      },
      {
        l: 'buttons.global_allow',
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
      elEntryBtn.innerHTML = btn.l
      this._localized.push({ el: elEntryBtn, l: btn.l })
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
            l: 'buttons.deny',
            c: ['otua-deny', 'ot-btn', 'ot-btn-sm'],
            a: { 'data-ot-settings-srv-ua': 'deny' },
            h: this._onDenyServiceClick.bind(this),
          },
          {
            l: 'buttons.allow',
            c: ['otua-allow', 'ot-btn', 'ot-btn-sm'],
            a: { 'data-ot-settings-srv-ua': 'allow' },
            h: this._onAllowServiceClick.bind(this),
          },
        ]
        for (const btn of btns) {
          const elServiceBtn = createElmt('button', btn.c, btn.a)
          this._localized.push({ el: elServiceBtn, l: btn.l })
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
    this._localized.push({ el: elEntryCPInfo, l: 'credits' })
    const elEntryCPLogo = createElmt('div', ['ot-settings__cp-logo'])
    elEntryCPLogo.append(getLogoElement())
    elEntryCP.append(elEntryCPInfo)
    elEntryCP.append(elEntryCPLogo)
    this._d.sc.append(elEntryCP)
  }
  _onMainTriggerClick(): void {
    this._triggerDisplayed = false
    this._entryDisplayed = true
    this._manualOpen = true
    this.render()
  }
  _onMainCloseClick(): void {
    this._trackingGuard.setUnreviewedConsents(false)
    this._services = this._trackingGuard.getTrackingServices()
    this._triggerDisplayed = true
    this._entryDisplayed = false
    this._settingsDisplayed = false
    this._manualOpen = false
    this.render()
  }
  _onSettingsOpenClick(): void {
    this._settingsDisplayed = true
    this.render()
  }
  _onSettingsCloseClick(): void {
    this._settingsDisplayed = false
    if (!this._manualOpen) {
      this._triggerDisplayed = this._trackingGuard.isReviewed()
      this._entryDisplayed = !this._trackingGuard.isReviewed()
    }
    this.render()
  }
  _onEAllowAllServicesClick(): void {
    console.log('ok');
    
    this._trackingGuard.setConsent(true)
    this._triggerDisplayed = true
    this._entryDisplayed = false
    this._services = this._trackingGuard.getTrackingServices()
    this.render()
  }
  _onEDenyAllServicesClick(): void {
    this._trackingGuard.setConsent(false)
    this._triggerDisplayed = true
    this._entryDisplayed = false
    this._services = this._trackingGuard.getTrackingServices()
    this.render()
  }
  _onSAllowAllServicesClick(): void {
    this._trackingGuard.setConsent(true)
    this._services = this._trackingGuard.getTrackingServices()
    this.render()
  }
  _onSDenyAllServicesClick(): void {
    this._trackingGuard.setConsent(false)
    this._services = this._trackingGuard.getTrackingServices()
    this.render()
  }
  _onAllowServiceClick(service: string): void {
    this._trackingGuard.setConsent(true, service)
    this._services = this._trackingGuard.getTrackingServices()
    this.render()
  }
  _onDenyServiceClick(service: string): void {
    this._trackingGuard.setConsent(false, service)
    this._services = this._trackingGuard.getTrackingServices()
    this.render()
  }
  _getServiceStateLabel(srv: TrackingServiceContainer): string {
    if (!srv.consent.reviewed) return this._i18n.t('states.pending')
    if (srv.consent.value) return this._i18n.t('states.allowed')
    return this._i18n.t('states.denied')
  }
  render(): void {
    // base
    if (this._triggerDisplayed) {
      this._d.r.append(this._d.tr)
    } else {
      this._d.tr.remove()
    }
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
    // i18n
    for (const elmt of this._localized) elmt.el.innerHTML = this._i18n.t(elmt.l)
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
  setServices(services: TrackingServiceContainer[]): void {
    this._services = services
  }
  init(): void {
    this._triggerDisplayed = this._trackingGuard.isReviewed()
    this._entryDisplayed = !this._trackingGuard.isReviewed()
    this._initBase()
    this._initTrigger()
    this._initEntry()
    this._initSettingsBase()
    this._initSettingsHeader()
    this._initSettingsServices()
    this._initSettingsFooter()
  }
  mount(): void {
    this.render()
    document.body.append(this._d.r)
  }
}
