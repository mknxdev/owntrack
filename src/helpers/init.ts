import { Config } from '../types'

export const checkForValidConfig = (config: Config): boolean => {
  try {
    // config
    if (!config)
      throw new Error(
        'OwnTrack: A configuration object is required at first call.',
      )
    // config.services
    if (!Array.isArray(config.services))
      throw new Error(`OwnTrack: 'services' must be an array.`)
    // config.services.service
    if (config.services) {
      for (const srv of config.services) {
        if (!srv.name) throw new Error(`OwnTrack: Service: 'name' is required.`)
        if (srv.label && typeof srv.label !== 'string')
          throw new Error(`OwnTrack: Service: 'label' must be a string.`)
        if (srv.type && typeof srv.type !== 'string')
          throw new Error(`OwnTrack: Service: 'type' must be a string.`)
        if (srv.description && typeof srv.description !== 'string')
          throw new Error(`OwnTrack: Service: 'description' must be a string.`)
        if (!srv.trackingScriptUrl)
          throw new Error(`OwnTrack: Service: 'trackingScriptUrl' is required.`)
        if (typeof srv.trackingScriptUrl !== 'string')
          throw new Error(
            `OwnTrack: Service: 'trackingScriptUrl' must be a string.`,
          )
        if (!srv.onInit || typeof srv.onInit !== 'function')
          throw new Error(`OwnTrack: Service: 'onInit' callback is required.`)
        if (!srv.handlers)
          throw new Error(`OwnTrack: Service: 'handlers' is required.`)
        if (typeof srv.handlers !== 'object')
          throw new Error(`OwnTrack: Service: 'handlers' must be an object.`)
      }
    }
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}

export const checkForValidServiceName = (name: string, services: string[]) => {
  try {
    if (!services.includes(name))
      throw new Error(
        `OwnTrack: '${name}' service is not registered.`,
      )
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}
