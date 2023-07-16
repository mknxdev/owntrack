import ServiceWrapper from './TrackingServiceWrapper'

export type ConfigService = {
  name: string
  label?: string
  trackingScriptUrl: string
  onInit: Function
  handlers: object
}
export type Config = {
  services: ConfigService[]
}
export type TrackingService = {
  name: string
  consent: {
    value: boolean
    reviewed: boolean
  }
  sw: ServiceWrapper
}
export type TrackingServiceConsent = {
  srv: string
  v: boolean
  r: boolean
}
