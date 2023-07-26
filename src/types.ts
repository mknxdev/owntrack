import TrackingService from './TrackingService'

// Core
export type Consent = {
  value: boolean
  reviewed: boolean
}
export type TrackingServiceContainer = {
  isEditable: boolean
  name: string
  type?: string
  description?: string
  host?: string
  guard?: {
    bypass: boolean
    anonymization: {
      data: string[]
      placeholder: string
    }
  }
  consent: Consent
  ts: TrackingService
}

// Locales
export type LocaleDefinition = any
export type Locales = {
  en?: LocaleDefinition
  fr?: LocaleDefinition
}

// User Config
export type ConfigService = {
  name: string
  label: string
  type: string
  description: string
  scripts: { url: string }[]
  onInit: Function
  handlers: object
  host: ''
  guard: {
    bypass: false
    anonymization: {
      data: string[]
      placeholder: string
    }
  }
}
export type Config = {
  enableRequiredCookies?: boolean
  services: ConfigService[]
  locale?: string
  locales?: Locales
}
