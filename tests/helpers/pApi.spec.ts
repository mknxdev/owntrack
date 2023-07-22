import { expect, jest, test } from '@jest/globals'
import { checkForValidConfig } from '@src/helpers/pApi'
import { Config } from '@src/types'

global.global.console.error = jest.fn()
const cslError = jest
  .spyOn(global.console, 'error')
  .mockImplementation(() => {})

afterEach(() => {
  cslError.mockClear()
})

describe('helpers.pApi.checkForValidConfig', () => {
  test('valid config payloads (global)', () => {
    const config1: Config = { enableRequiredCookies: true, services: [] }
    const config2: Config = { enableRequiredCookies: false, services: [] }
    expect(checkForValidConfig(config1)).toBe(true)
    expect(checkForValidConfig(config2)).toBe(true)
  })

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
          handlers: { trackingFn: () => {} },
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
          handlers: { trackingFn: () => {} },
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

  test('invalid config (enableRequiredCookies)', () => {
    const config1 = {}
    const config2 = { enableRequiredCookies: 'invalid', services: [] }
    const config3 = { enableRequiredCookies: 42, services: [] }
    const config4 = { enableRequiredCookies: [], services: [] }
    const config5 = { enableRequiredCookies: {}, services: [] }
    const config6 = { enableRequiredCookies: () => {}, services: [] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config5 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config6 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(6)
  })

  test('invalid config (services)', () => {
    const config1 = { services: [{}] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(1)
  })

  test('invalid config (services.service.name)', () => {
    const config1 = { services: [{ name: true }] }
    const config2 = { services: [{ name: 42 }] }
    const config3 = { services: [{ name: {} }] }
    const config4 = { services: [{ name: [] }] }
    const config5 = { services: [{ name: () => {} }] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config5 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(5)
  })

  test('invalid config (services.service.label)', () => {
    const config1 = { services: [{ label: true }] }
    const config2 = { services: [{ label: 42 }] }
    const config3 = { services: [{ label: {} }] }
    const config4 = { services: [{ label: [] }] }
    const config5 = { services: [{ label: () => {} }] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config5 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(5)
  })

  test('invalid config (services.service.type)', () => {
    const config1 = { services: [{ type: true }] }
    const config2 = { services: [{ type: 42 }] }
    const config3 = { services: [{ type: {} }] }
    const config4 = { services: [{ type: [] }] }
    const config5 = { services: [{ type: () => {} }] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config5 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(5)
  })

  test('invalid config (services.service.description)', () => {
    const config1 = { services: [{ description: true }] }
    const config2 = { services: [{ description: 42 }] }
    const config3 = { services: [{ description: {} }] }
    const config4 = { services: [{ description: [] }] }
    const config5 = { services: [{ description: () => {} }] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config5 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(5)
  })

  test('invalid config (services.service.scripts)', () => {
    const config1 = { services: [{ scripts: 'invalid' }] }
    const config2 = { services: [{ scripts: 42 }] }
    const config3 = { services: [{ scripts: true }] }
    const config4 = { services: [{ scripts: {} }] }
    const config5 = { services: [{ scripts: () => {} }] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config4 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config5 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(5)
  })

  test('invalid config (services.service.onInit)', () => {
    const config1 = { services: [{ onInit: 'invalid' }] }
    const config2 = { services: [{ onInit: 42 }] }
    const config3 = { services: [{ onInit: true }] }
    expect(checkForValidConfig(config1 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config2 as unknown as Config)).toBe(false)
    expect(checkForValidConfig(config3 as unknown as Config)).toBe(false)
    expect(global.console.error).toHaveBeenCalledTimes(3)
  })
})
