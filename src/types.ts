export type TrackingServiceConsent = {
  name: string
  consent: boolean
  reviewed: boolean
}
export type TrackingService = TrackingServiceConsent & {
  label: string
}
