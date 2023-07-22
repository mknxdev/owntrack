import { Config } from '../types'

export const checkForValidConfig = (config: Config): boolean => {
  try {
    // config
    if (!config)
      throw new Error(
        'OwnTrack: A configuration object is required at first call.',
      )
    // config.enableRequiredCookies
    if (config.enableRequiredCookies && typeof config.enableRequiredCookies !== 'boolean')
      throw new Error(`OwnTrack: 'enableRequiredCookies' must be a boolean.`)
    // config.services
    if (!config.services) throw new Error(`OwnTrack: 'services' is required.`)
    if (!Array.isArray(config.services))
      throw new Error(`OwnTrack: 'services' must be an array.`)
    // config.services.service
    if (config.services) {
      for (const srv of config.services) {
        // config.services.service.name
        if (!srv.name)
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'name' is required.`,
          )
        if (config.services.filter((s) => s.name === srv.name).length > 1)
          throw new Error(`OwnTrack: Service names must be unique.`)
        // config.services.service[scriptUrl | onInit | handlers]
        if (!srv.scripts && !srv.onInit && !srv.handlers)
          throw new Error(
            `OwnTrack: Service [${srv.name}]' must contain at least one of the following properties: scripts, onInit, handlers.`,
          )
        // config.services.service.label
        if (srv.label && typeof srv.label !== 'string')
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'label' must be a string.`,
          )
        // config.services.service.type
        if (srv.type && typeof srv.type !== 'string')
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'type' must be a string.`,
          )
        // config.services.service.description
        if (srv.description && typeof srv.description !== 'string')
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'description' must be a string.`,
          )
        // config.services.service.scripts
        if (srv.scripts && !Array.isArray(srv.scripts))
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'scripts' must be an array.`,
          )
        // config.services.service.onInit
        if (srv.onInit && typeof srv.onInit !== 'function')
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'onInit' must be a function.`,
          )
        // config.services.service.handlers
        if (srv.handlers && typeof srv.handlers !== 'object')
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'handlers' must be an object.`,
          )
        if (
          srv.handlers &&
          Object.entries(srv.handlers).some((h) => typeof h[1] !== 'function')
        )
          throw new Error(
            `OwnTrack: Service [${srv.name}]: 'handlers' properties must be function declarations.`,
          )
      }
    }
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}

export const fillDefaultValues = (config: Config): Config => {
  return {
    enableRequiredCookies: config.enableRequiredCookies || true,
  }
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
