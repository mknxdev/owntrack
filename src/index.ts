import { Config } from './types'
import { checkForValidConfig } from './helpers/pApi'
import OwnTrack from './OwnTrack'
import './css/ot.css'

declare global {
  interface Window {
    __owntrack: OwnTrack
  }
}

export default (config: Config): OwnTrack => {
  if (!window.__owntrack && checkForValidConfig(config))
    window.__owntrack = new OwnTrack(config)
  return window.__owntrack
}
