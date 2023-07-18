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
        // config.services.service[scriptUrl | onInit | handlers]
        if (!srv.scriptUrl && !srv.onInit && !srv.handlers)
          throw new Error(
            `OwnTrack: Service must contain at least one of the following properties: scriptUrl, onInit, handlers.`,
          )
        // config.services.service.name
        if (!srv.name) throw new Error(`OwnTrack: Service: 'name' is required.`)
        // config.services.service.label
        if (srv.label && typeof srv.label !== 'string')
          throw new Error(`OwnTrack: Service: 'label' must be a string.`)
        // config.services.service.type
        if (srv.type && typeof srv.type !== 'string')
          throw new Error(`OwnTrack: Service: 'type' must be a string.`)
        // config.services.service.description
        if (srv.description && typeof srv.description !== 'string')
          throw new Error(`OwnTrack: Service: 'description' must be a string.`)
        // config.services.service.scriptUrl
        if (srv.scriptUrl && typeof srv.scriptUrl !== 'string')
          throw new Error(`OwnTrack: Service: 'scriptUrl' must be a string.`)
        // config.services.service.onInit
        if (srv.onInit && typeof srv.onInit !== 'function')
          throw new Error(`OwnTrack: Service: 'onInit' must be a function.`)
        // config.services.service.handlers
        if (srv.handlers && typeof srv.handlers !== 'object')
          throw new Error(`OwnTrack: Service: 'handlers' must be an object.`)
        if (
          srv.handlers &&
          Object.entries(srv.handlers).some((h) => typeof h[1] !== 'function')
        )
          throw new Error(
            `OwnTrack: Service: 'handlers' properties must be function declarations.`,
          )
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
      throw new Error(`OwnTrack: '${name}' service is not registered.`)
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}
