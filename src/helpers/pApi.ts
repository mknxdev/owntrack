import { Config, ConfigService, Locales, LocaleDefinition } from '../types'
// @ts-ignore
import defaultLocale from '../../locales/en.yml'

const err = (msg: string) => {
  throw new Error(msg)
}

const checkServicesConf = (services: ConfigService[]): boolean => {
  try {
    // services
    if (!services) err(`OwnTrack: 'services' is required.`)
    if (!Array.isArray(services)) err(`OwnTrack: 'services' must be an array.`)
    // services.service
    if (services) {
      for (const srv of services) {
        // services.service.name
        if (!srv.name.trim())
          err(`OwnTrack: Service [${srv.name}]: 'name' is required.`)
        if (services.filter((s) => s.name === srv.name).length > 1)
          err(`OwnTrack: Service names must be unique.`)
        // services.service.label
        if (srv.label && typeof srv.label !== 'string')
          err(`OwnTrack: Service [${srv.name}]: 'label' must be a string.`)
        // services.service.type
        if (srv.type && typeof srv.type !== 'string')
          err(`OwnTrack: Service [${srv.name}]: 'type' must be a string.`)
        // services.service.description
        if (srv.description && typeof srv.description !== 'string')
          err(
            `OwnTrack: Service [${srv.name}]: 'description' must be a string.`,
          )
        // services.service[scripts | onInit | handlers]
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
        // services.service.scripts
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
        // services.service.onInit
        if (srv.onInit && typeof srv.onInit !== 'function')
          err(`OwnTrack: Service [${srv.name}]: 'onInit' must be a function.`)
        // services.service.handlers
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

const checkGlobalConf = (config: Config): boolean => {
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
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}

const checkLocalesConf = (locales: Locales): boolean => {
  try {
    if (locales && typeof locales !== 'object')
      err(`OwnTrack: 'locales' must be an object.`)
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}

export const checkForValidConfig = (config: Config): boolean => {
  return (
    checkServicesConf(config.services) &&
    checkGlobalConf(config) &&
    checkLocalesConf(config.locales)
  )
}

export const fillDefaultValues = (
  config: Config,
  locales: LocaleDefinition = undefined,
): Config => {
  const defaultLocaleId = locales ? Object.keys(locales)[0] : 'en'
  return {
    enableRequiredCookies:
      config.enableRequiredCookies !== undefined
        ? config.enableRequiredCookies
        : true,
    locales: locales || { en: defaultLocale },
    locale: config.locale || defaultLocaleId,
    services: config.services.map((s) => ({
      name: s.name,
      label: s.label || undefined,
      type: s.type || undefined,
      description: s.description || undefined,
      scripts: s.scripts
        ? s.scripts.map((sc) => ({
            url: sc.url,
          }))
        : undefined,
      onInit: s.onInit || undefined,
      handlers: s.handlers || undefined,
    })),
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
