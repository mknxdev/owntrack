export default class UIManager {
  _isConsentReviewed = false
  _elRoot: Element

  constructor() {
    this._initRoot()
    this._initEntry()
    window.addEventListener('DOMContentLoaded', this._mount.bind(this))
  }

  _initRoot() {
    this._elRoot = document.createElement('div')
    this._elRoot.classList.add('ot-root')
  }

  _initEntry() {
    const elBanner = document.createElement('div')
    elBanner.classList.add('ot-banner')
    const btns = [
      { t: 'Allow', c: 'allow', h: this._onAllowAll },
      { t: 'Deny', c: 'deny', h: this._onDenyAll },
    ]
    for (const btn of btns) {
      const elBtn = document.createElement('button')
      elBtn.classList.add(btn.c)
      elBtn.innerText = btn.t
      elBtn.addEventListener('click', btn.h)
      elBanner.append(elBtn)
    }
    this._elRoot.append(elBanner)
  }

  _onAllowAll() {
    console.log('allowed')
  }

  _onDenyAll() {
    console.log('denied')
  }

  _mount() {
    document.body.append(this._elRoot)
  }

  setConsentReviewed(value: boolean): void {
    this._isConsentReviewed = value
  }
}
