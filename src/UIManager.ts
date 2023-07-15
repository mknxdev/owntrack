import { OTService } from './types'
import { createElmt, generateIconElement } from './helpers/ui'

export default class UIManager {
  _services: OTService[] = []
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

  constructor() {
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
        c: ['settings', 'ot-btn', 'ot-ghost'],
        h: this._onOpenSettingsClick.bind(this),
      },
      {
        t: 'Deny',
        c: ['deny', 'ot-btn', 'ot-error'],
        h: this._onDenyAllClick.bind(this),
      },
      {
        t: 'Allow',
        c: ['allow', 'ot-btn', 'ot-success'],
        h: this._onAllowAllClick.bind(this),
      },
    ]
    const elEntryBtns = createElmt('div', ['ot-entry__btns'])
    for (const btn of btns) {
      const elEntryBtn = document.createElement('button')
      btn.c.forEach((c) => elEntryBtn.classList.add(c))
      elEntryBtn.innerText = btn.t
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
    for (const i in this._d.sr.children)
      if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
        content = this._d.sr.children.item(Number(i))
    const elHeadline = createElmt('h1')
    elHeadline.innerText = 'Tracking Settings'
    const elNotice = createElmt('p', ['ot-settings__notice'])
    elNotice.innerHTML =
      'Here you can manage tracking/analytics acceptance for each service.<br/> You can also accept or deny tracking for all services at once.'
    const elGActions = createElmt('div', ['ot-settings__main-actions'])
    const btns = [
      {
        t: 'Deny all',
        c: ['deny', 'ot-btn', 'ot-error'],
        h: this._onDenyAllClick.bind(this),
      },
      {
        t: 'Allow all',
        c: ['allow', 'ot-btn', 'ot-success'],
        h: this._onAllowAllClick.bind(this),
      },
    ]
    const elGActionsBtns = createElmt('div', [
      'ot-settings__main-actions__btns',
    ])
    for (const btn of btns) {
      const elEntryBtn = document.createElement('button')
      btn.c.forEach((c) => elEntryBtn.classList.add(c))
      elEntryBtn.innerText = btn.t
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

  _onOpenSettingsClick(): void {
    for (const i in this._d.r.children)
      if (
        !this._d.r.children
          .item(Number(i))
          .classList.contains('ot-settings-overlay')
      )
        this._d.r.append(this._d.sr)
  }
  _onCloseSettingsClick(): void {
    for (const i in this._d.r.children)
      if (
        this._d.r.children
          .item(Number(i))
          .classList.contains('ot-settings-overlay')
      )
        this._d.sr.remove()
  }
  _onAllowAllClick(): void {
    console.log('allowed')
  }
  _onDenyAllClick(): void {
    console.log('denied')
  }

  mount(): void {
    let settings: Element
    for (const i in this._d.sr.children)
      if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
        settings = this._d.sr.children.item(Number(i))
    settings.append(this._d.srvr)
    this._d.r.append(this._d.sr)
    document.body.append(this._d.r)
  }
  setTrackingServices(services: OTService[]): void {
    this._services = services
    for (const service of services) {
      const elSrv = createElmt('div', ['ot-settings__service'])
      console.log(service)
    }
  }
  setConsentReviewed(value: boolean): void {
    this._isConsentReviewed = value
  }
}
