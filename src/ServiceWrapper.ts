export default class ServiceWrapper {
  n: string
  _l: string
  _onInit: Function

  constructor(name: string, label: string, onInit: Function) {
    this.n = name
    this._l = label
    this._onInit = onInit
  }

  get name() {
    return this._l || this.n
  }
}
