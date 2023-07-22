import { expect, jest, test } from '@jest/globals'
import { checkForValidConfig } from '@src/helpers/pApi'
import { Config } from '@src/types'

beforeAll(() => {
  jest.spyOn(global.console, 'error').mockImplementation(() => {})
})

describe('helpers.pApi.checkForValidConfig', () => {
  test('valid config payloads (services)', () => {
    const config1: Config = {
      services: [
        {
          name: 'ga',
          scripts: [
            { url: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' },
          ],
        },
      ],
    }
    const config2: Config = {
      services: [
        {
          name: 'ga',
          onInit: () => {},
        },
      ],
    }
    const config3: Config = {
      services: [
        {
          name: 'ga',
          handlers: {
            trackingFn: () => {},
          },
        },
      ],
    }
    const config4: Config = {
      services: [
        {
          name: 'ga',
          scripts: [
            { url: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' },
          ],
          onInit: () => {},
          handlers: {
            trackingFn: () => {},
          },
        },
      ],
    }
    const config5: Config = {
      services: [
        {
          name: 'ga',
          label: 'Google Analytics',
          onInit: () => {},
        },
      ],
    }
    const config6: Config = {
      services: [
        {
          name: 'ga',
          type: 'Analytics',
          onInit: () => {},
        },
      ],
    }
    const config7: Config = {
      services: [
        {
          name: 'ga',
          description: 'Google analytics tool.',
          onInit: () => {},
        },
      ],
    }
    expect(checkForValidConfig(config1)).toBe(true)
    expect(checkForValidConfig(config2)).toBe(true)
    expect(checkForValidConfig(config3)).toBe(true)
    expect(checkForValidConfig(config4)).toBe(true)
    expect(checkForValidConfig(config5)).toBe(true)
    expect(checkForValidConfig(config6)).toBe(true)
    expect(checkForValidConfig(config7)).toBe(true)
  })

  test('valid config payloads (optional fields)', () => {
    const config1: Config = { enableRequiredCookies: true, services: [] }
    const config2: Config = { enableRequiredCookies: false, services: [] }
    expect(checkForValidConfig(config1)).toBe(true)
    expect(checkForValidConfig(config2)).toBe(true)
  })

  test('invalid config payloads (services)', () => {
    // @ts-ignore
    const config1 = { enableRequiredCookies: 'invalid', services: [] }
    const config2 = { enableRequiredCookies: 42, services: [] }
    const config3 = { enableRequiredCookies: [], services: [] }
    const config4 = { enableRequiredCookies: {}, services: [] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(console.error).toHaveBeenCalledTimes(4)
  })
})
