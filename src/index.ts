import { Config, Locales } from './types'
import { checkForValidConfig, fillDefaultValues } from './helpers/pApi'
import OwnTrack from './OwnTrack'
import './css/ot.css'

declare global {
  interface Window {
    __owntrack: OwnTrack
  }
}

const getLoadedLocales = (): Locales => {
  return { en: {}, fr: {} }
}

export default (config: Config): OwnTrack => {
  if (!window.__owntrack && checkForValidConfig(config)) {
    config = fillDefaultValues(config, getLoadedLocales())
    window.__owntrack = new OwnTrack(config)
  }
  return window.__owntrack
}
