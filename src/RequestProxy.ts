type ServiceData = { name: string; vars: string[]; placeholder: string }

export default class RequestProxy {
  _services: ServiceData[] = []

  setService(name: string, vars: string[], placeholder: string): void {
    this._services.push({ name, vars, placeholder })
  }

  init(): void {
    console.log(this._services)
    // XMLHttpRequest.prototype.open = function (method, url) {
    //   console.log('.open', method, url)
    //   return XMLHttpRequest.prototype.open.apply(this, arguments)
    // }
    // XMLHttpRequest.prototype.send = function () {
    //   console.log('.send')
    // }
  }
}
