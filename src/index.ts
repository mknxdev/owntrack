import { Config } from './types'
import { checkForValidInit } from './helpers/init'
import OwnTrack from './OwnTrack'

declare global {
  interface Window {
    _OT: OwnTrack
  }
}

export default (config: Config): OwnTrack => {
  if (!window._OT && checkForValidInit(config))
    window._OT = new OwnTrack(config)
  return window._OT
}
