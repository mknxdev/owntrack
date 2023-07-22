import { Config } from '../types'

const err = (msg: string) => {
  throw new Error(msg)
}

export const checkForValidConfig = (config: Config): boolean => {
  try {
    // config
    if (!config)
      err('OwnTrack: A configuration object is required at first call.')
    // config.enableRequiredCookies
    if (
      config.enableRequiredCookies &&
      typeof config.enableRequiredCookies !== 'boolean'
    )
      err(`OwnTrack: 'enableRequiredCookies' must be a boolean.`)
    // config.services
    if (!config.services) err(`OwnTrack: 'services' is required.`)
    if (!Array.isArray(config.services))
      err(`OwnTrack: 'services' must be an array.`)
    // config.services.service
    if (config.services) {
      for (const srv of config.services) {
        // config.services.service.name
        if (!srv.name.trim())
          err(`OwnTrack: Service [${srv.name}]: 'name' is required.`)
        if (config.services.filter((s) => s.name === srv.name).length > 1)
          err(`OwnTrack: Service names must be unique.`)
        // config.services.service.label
        if (srv.label && typeof srv.label !== 'string')
          err(`OwnTrack: Service [${srv.name}]: 'label' must be a string.`)
        // config.services.service.type
        if (srv.type && typeof srv.type !== 'string')
          err(`OwnTrack: Service [${srv.name}]: 'type' must be a string.`)
        // config.services.service.description
        if (srv.description && typeof srv.description !== 'string')
          err(
            `OwnTrack: Service [${srv.name}]: 'description' must be a string.`,
          )
        // config.services.service[scripts | onInit | handlers]
        if (
          (!srv.scripts || !srv.scripts.length) &&
          !srv.onInit &&
          !srv.handlers
        )
          err(
            `OwnTrack: Service [${srv.name}]' must contain at least one of the following properties: scripts, onInit, handlers.`,
          )

        if (!srv.scripts && !srv.onInit && !Object.keys(srv.handlers).length)
          err(
            `OwnTrack: Service [${srv.name}]: 'handlers' must contain at least one property if 'scripts' and 'onInit' are omitted.`,
          )
        // config.services.service.scripts
        if (srv.scripts && !Array.isArray(srv.scripts))
          err(`OwnTrack: Service [${srv.name}]: 'scripts' must be an array.`)
        if (srv.scripts && srv.scripts.some((s) => !s.url))
          err(
            `OwnTrack: Service [${srv.name}]: 'scripts' elements must contain an 'url' property.`,
          )
        if (srv.scripts && srv.scripts.some((s) => typeof s.url !== 'string'))
          err(
            `OwnTrack: Service [${srv.name}]: 'url' property of 'scripts' elements must be a string.`,
          )
        // config.services.service.onInit
        if (srv.onInit && typeof srv.onInit !== 'function')
          err(`OwnTrack: Service [${srv.name}]: 'onInit' must be a function.`)
        // config.services.service.handlers
        if (srv.handlers && typeof srv.handlers !== 'object')
          err(`OwnTrack: Service [${srv.name}]: 'handlers' must be an object.`)
        if (
          srv.handlers &&
          Object.entries(srv.handlers).some((h) => typeof h[1] !== 'function')
        )
          err(
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
    services: config.services,
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
