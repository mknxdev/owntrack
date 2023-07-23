import TrackingService from './TrackingService'

export type Consent = {
  value: boolean
  reviewed: boolean
}
export type TrackingServiceContainer = {
  isEditable: boolean
  name: string
  type?: string
  description?: string
  consent: Consent
  ts: TrackingService
}
export type TrackingServiceConsent = {
  srv: string
  v: boolean
  r: boolean
}

export type LocaleDefinition = {}
export type Locales = {
  en: LocaleDefinition,
  fr: LocaleDefinition
}
export type ConfigService = {
  name: string
  label?: string
  type?: string
  description?: string
  scripts?: { url: string }[]
  onInit?: Function
  handlers?: object
}
export type Config = {
  enableRequiredCookies?: boolean
  services: ConfigService[]
  locale?: string
  locales?: Locales
}