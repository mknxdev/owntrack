type ServiceData = { name: string; vars: string[]; placeholder: string }
type Request = { method: string; url: string; data?: unknown }

export default class RequestProxy {
  _services: ServiceData[] = []

  setService(name: string, vars: string[], placeholder: string): void {
    this._services.push({ name, vars, placeholder })
  }

  init(): void {
    this._initURLInterceptor()
    this._initBodyInterceptor()
  }
  _initURLInterceptor(): void {
    const self = this
    const raw = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      const anonVars = self._services.map(s => s.vars).flat()
      // let [base, query] = url.split('?')
      // for (const v of anonVars)
      //   if (rewritedUrl.indexOf(v) !== -1)
      // return raw.apply(this, arguments)
    }
  }
  _initBodyInterceptor(): void {
    const raw = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
      return raw.apply(this, arguments)
    }
  }
}
