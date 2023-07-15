import { Config } from '../types'

export const checkForValidInit = (config: Config): boolean => {
  try {
    // config
    if (!config)
      throw new Error(
        'OwnTrack: A configuration object is required at first call.',
      )
    // config.services
    if (!config.services || !config.services.length)
      throw new Error('OwnTrack: At least one service is required.')
    // config.services.service
    for (const srv of config.services) {
      if (!srv.name) throw new Error(`OwnTrack: Service: 'name' is required.`)
      if (srv.label && typeof srv.label !== 'string')
        throw new Error(`OwnTrack: Service: 'label' must be of type string.`)
      if (!srv.trackingScriptUrl)
        throw new Error(`OwnTrack: Service: 'trackingScriptUrl' is required.`)
      if (typeof srv.trackingScriptUrl !== 'string')
        throw new Error(
          `OwnTrack: Service: 'trackingScriptUrl' must be of type string.`,
        )
      if (!srv.handlers)
        throw new Error(`OwnTrack: Service: 'handlers' is required.`)
      if (typeof srv.handlers !== 'object')
        throw new Error(`OwnTrack: Service: 'handlers' must be an object.`)
      if (!srv.handlers.init || typeof srv.handlers.init !== 'function')
        throw new Error(
          `OwnTrack: Service: 'handlers' must contain an 'init' method.`,
        )
    }
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}
