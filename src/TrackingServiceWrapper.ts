export default class TrackingServiceWrapper {
  name: string
  _l: string
  _onInit: Function

  constructor(name: string, label: string, onInit: Function) {
    this.name = name
    this._l = label
    this._onInit = onInit
  }

  get label() {
    return this._l || this.name
  }
}
