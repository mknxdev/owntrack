export default class TrackingService {
  name: string
  _l: string

  constructor(name: string, label: string) {
    this.name = name
    this._l = label
  }

  get label() {
    return this._l || this.name
  }
}
