import { Locales, Config } from './types'
import { checkForValidConfig, fillDefaultValues } from './helpers/pApi'
import OwnTrack from './OwnTrack'
import './css/ot.css'
// @ts-ignore
import defaultLocale from '../locales/en.yml'

declare global {
  interface Window {
    __owntrack: OwnTrack
    __owntrack_locales: Locales
  }
}

const getLoadedLocales = (): Locales => {
  return window.__owntrack_locales || undefined
}

export default (config: Config): OwnTrack => {
  if (!window.__owntrack && checkForValidConfig(config)) {
    config = fillDefaultValues(config, getLoadedLocales(), defaultLocale)
    window.__owntrack = new OwnTrack(config)
  }
  return window.__owntrack
}
