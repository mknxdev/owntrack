import { Config } from './types'
import { checkForValidConfig } from './helpers/pApi'
import OwnTrack from './OwnTrack'
import './css/ot.css'

declare global {
  interface Window {
    _OT: OwnTrack
  }
}

export default (config: Config): OwnTrack => {
  if (!window._OT && checkForValidConfig(config))
    window._OT = new OwnTrack(config)
  return window._OT
}
