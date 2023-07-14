import { Config } from '../types'

export const checkForValidInit = (config: Config): boolean => {
  try {
    if (!config)
      throw new Error(
        'OwnTrack: A configuration object is required at first call.',
      )
  } catch (err) {
    console.error(err.message)
    return false
  }
  try {
    if (!config.services || !config.services.length)
      throw new Error('OwnTrack: At least one service is required.')
  } catch (err) {
    console.error(err.message)
    return false
  }
  return true
}
