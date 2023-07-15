export default class UIManager {
  _isConsentReviewed = false
  _elRoot: Element

  constructor() {
    this._initBase()
    this._initEntry()
    this._initSettingsModal()
    window.addEventListener('DOMContentLoaded', this._mount.bind(this))
  }

  _initBase() {
    this._elRoot = document.createElement('div')
    this._elRoot.classList.add('ot-root')
  }

  _initEntry() {
    const elEntryWrapper = document.createElement('div')
    elEntryWrapper.classList.add('ot-entrywrapper')
    const elEntry = document.createElement('div')
    elEntry.classList.add('ot-entry')
    const elEntryNotice = document.createElement('div')
    elEntryNotice.classList.add('ot-entry__notice')
    elEntryNotice.innerHTML =
      '<p>This website uses cookies &amp; analytics for tracking and/or advertising purposes. You can choose to accept them or not.</p>'
    elEntry.append(elEntryNotice)
    const btns = [
      { t: 'Settings', c: ['settings', 'ot-ghost'], h: this._onSettingsClick },
      { t: 'Deny', c: ['deny', 'ot-error'], h: this._onDenyAllClick },
      { t: 'Allow', c: ['allow', 'ot-success'], h: this._onAllowAllClick },
    ]
    const elEntryBtns = document.createElement('div')
    elEntryBtns.classList.add('ot-entry__btns')
    for (const btn of btns) {
      const elEntryBtn = document.createElement('button')
      btn.c.forEach((c) => elEntryBtn.classList.add(c))
      elEntryBtn.innerText = btn.t
      elEntryBtn.addEventListener('click', btn.h)
      elEntryBtns.append(elEntryBtn)
    }
    elEntry.append(elEntryBtns)
    elEntryWrapper.append(elEntry)
    this._elRoot.append(elEntryWrapper)
  }

  _initSettingsModal() {}

  _onSettingsClick() {}

  _onAllowAllClick() {
    console.log('allowed')
  }

  _onDenyAllClick() {
    console.log('denied')
  }

  _mount() {
    document.body.append(this._elRoot)
  }

  setConsentReviewed(value: boolean): void {
    this._isConsentReviewed = value
  }
}
