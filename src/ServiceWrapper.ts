export default class ServiceWrapper {
  _n: string
  _onInit: Function

  constructor(name: string, onInit: Function) {
    this._n = name
    this._onInit = onInit
  }

  get name() {
    return this._n
  }
}
