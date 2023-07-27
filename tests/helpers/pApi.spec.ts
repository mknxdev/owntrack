import { jest, test, expect } from '@jest/globals'
import { UserConfig as UserCfg } from '@src/types'
import {
  checkForValidConfig as checkConfig,
  checkForValidServiceName as checkServiceName,
  fillDefaultValues as fillDefault,
} from '@src/helpers/pApi'

global.global.console.error = jest.fn()
const cslError = jest
  .spyOn(global.console, 'error')
  .mockImplementation(() => {})

afterEach(() => {
  cslError.mockClear()
})

describe('helpers.pApi.checkForValidConfig', () => {
  // VALID

  test('valid config (enableRequiredCookies)', () => {
    const config1 = { enableRequiredCookies: true, services: [] }
    const config2 = { enableRequiredCookies: false, services: [] }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services)', () => {
    const config1 = { services: [] }
    const config2 = {
      services: [{ name: 'ga', scripts: [{ url: 'url' }] }],
    }
    const config3 = { services: [{ name: 'ga', onInit: () => {} }] }
    const config4 = {
      services: [{ name: 'ga', handlers: { fn: () => {} } }],
    }
    const config5 = {
      services: [
        {
          name: 'ga',
          scripts: [{ url: 'url' }],
          handlers: { fn: () => {} },
        },
      ],
    }
    const config6 = {
      services: [
        {
          name: 'ga',
          scripts: [{ url: 'url' }],
          onInit: () => {},
        },
      ],
    }
    const config7 = {
      services: [
        {
          name: 'ga',
          onInit: () => {},
          handlers: { fn: () => {} },
        },
      ],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config3 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config4 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config5 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config6 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config7 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.name)', () => {
    const config1 = { services: [{ name: 'ga', onInit: () => {} }] }
    const config2 = { services: [{ name: 'g-a', onInit: () => {} }] }
    const config3 = { services: [{ name: 'g_a', onInit: () => {} }] }
    const config4 = { services: [{ name: 'g$a', onInit: () => {} }] }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config3 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config4 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.label)', () => {
    const config1 = {
      services: [{ name: 'ga', label: ' ', onInit: () => {} }],
    }
    const config2 = {
      services: [{ name: 'ga', label: '-', onInit: () => {} }],
    }
    const config3 = {
      services: [{ name: 'ga', label: '$', onInit: () => {} }],
    }
    const config4 = {
      services: [{ name: 'ga', label: '123', onInit: () => {} }],
    }
    const config5 = {
      services: [{ name: 'ga', label: 'G. Analytics', onInit: () => {} }],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config3 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config4 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config5 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.type)', () => {
    const config1 = {
      services: [{ name: 'ga', type: ' ', onInit: () => {} }],
    }
    const config2 = {
      services: [{ name: 'ga', type: '-', onInit: () => {} }],
    }
    const config3 = {
      services: [{ name: 'ga', type: '$', onInit: () => {} }],
    }
    const config4 = {
      services: [{ name: 'ga', type: '123', onInit: () => {} }],
    }
    const config5 = {
      services: [{ name: 'ga', type: 'Analytics', onInit: () => {} }],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config3 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config4 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config5 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.description)', () => {
    const config1 = {
      services: [{ name: 'ga', description: ' ', onInit: () => {} }],
    }
    const config2 = {
      services: [{ name: 'ga', description: '-', onInit: () => {} }],
    }
    const config3 = {
      services: [{ name: 'ga', description: '$', onInit: () => {} }],
    }
    const config4 = {
      services: [{ name: 'ga', description: '123', onInit: () => {} }],
    }
    const config5 = {
      services: [
        { name: 'ga', description: 'G. Analytics tool.', onInit: () => {} },
      ],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config3 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config4 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config5 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.scripts)', () => {
    const config1 = {
      services: [{ name: 'ga', scripts: [{ url: 'url' }] }],
    }
    const config2 = {
      services: [{ name: 'ga', scripts: [{ url: 'url' }, { url: 'url2' }] }],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.onInit)', () => {
    const config1 = {
      services: [{ name: 'ga', onInit: () => {} }],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
  })

  test('valid config (services.service.handlers)', () => {
    const config1 = {
      services: [{ name: 'ga', handlers: { trackingFn: () => {} } }],
    }
    const config2 = {
      services: [
        {
          name: 'ga',
          handlers: { trackingFn: () => {}, anotherTrackingFn: () => {} },
        },
      ],
    }
    expect(checkConfig(config1 as unknown as UserCfg)).toBe(true)
    expect(checkConfig(config2 as unknown as UserCfg)).toBe(true)
  })

  // INVALID

  test('invalid config (enableRequiredCookies)', () => {
    const config1 = {}
    const config2 = { enableRequiredCookies: 'invalid', services: [] }
    const config3 = { enableRequiredCookies: 42, services: [] }
    const config4 = { enableRequiredCookies: [], services: [] }
    const config5 = { enableRequiredCookies: {}, services: [] }
    const config6 = { enableRequiredCookies: () => {}, services: [] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services)', () => {
    const config1 = { services: [{}] }
    const config2 = { services: [{ name: 'ga' }] }
    const config3 = { services: [{ name: 'ga', scripts: [] }] }
    const config4 = { services: [{ name: 'ga', scripts: [{}] }] }
    const config5 = {
      services: [{ name: 'ga', scripts: [{ url: true }] }],
    }
    const config6 = {
      services: [{ name: 'ga', scripts: [{ url: 42 }] }],
    }
    const config7 = {
      services: [{ name: 'ga', scripts: [{ url: {} }] }],
    }
    const config8 = {
      services: [{ name: 'ga', scripts: [{ url: [] }] }],
    }
    const config9 = {
      services: [{ name: 'ga', scripts: [{ url: () => {} }] }],
    }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config7 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config8 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config9 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.name)', () => {
    const config1 = { services: [{ name: '' }] }
    const config2 = { services: [{ name: ' ' }] }
    const config3 = { services: [{ name: true }] }
    const config4 = { services: [{ name: 42 }] }
    const config5 = { services: [{ name: {} }] }
    const config6 = { services: [{ name: [] }] }
    const config7 = { services: [{ name: () => {} }] }
    const config8 = { services: [{ name: 'ga' }, { name: 'ga' }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config7 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config8 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.label)', () => {
    const config1 = { services: [{ label: '' }] }
    const config2 = { services: [{ label: true }] }
    const config3 = { services: [{ label: 42 }] }
    const config4 = { services: [{ label: {} }] }
    const config5 = { services: [{ label: [] }] }
    const config6 = { services: [{ label: () => {} }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.type)', () => {
    const config1 = { services: [{ type: '' }] }
    const config2 = { services: [{ type: true }] }
    const config3 = { services: [{ type: 42 }] }
    const config4 = { services: [{ type: {} }] }
    const config5 = { services: [{ type: [] }] }
    const config6 = { services: [{ type: () => {} }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.description)', () => {
    const config1 = { services: [{ description: '' }] }
    const config2 = { services: [{ description: true }] }
    const config3 = { services: [{ description: 42 }] }
    const config4 = { services: [{ description: {} }] }
    const config5 = { services: [{ description: [] }] }
    const config6 = { services: [{ description: () => {} }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.scripts)', () => {
    const config1 = { services: [{ scripts: 'invalid' }] }
    const config2 = { services: [{ scripts: 42 }] }
    const config3 = { services: [{ scripts: true }] }
    const config4 = { services: [{ scripts: {} }] }
    const config5 = { services: [{ scripts: () => {} }] }
    const config6 = { services: [{ scripts: [] }] }
    const config7 = { services: [{ scripts: [{}] }] }
    const config8 = { services: [{ scripts: [{}, { url: 'url' }] }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config7 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config8 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.onInit)', () => {
    const config1 = { services: [{ onInit: 'invalid' }] }
    const config2 = { services: [{ onInit: 42 }] }
    const config3 = { services: [{ onInit: true }] }
    const config4 = { services: [{ onInit: {} }] }
    const config5 = { services: [{ onInit: [] }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })

  test('invalid config (services.service.handlers)', () => {
    const config1 = { services: [{ handlers: 'invalid' }] }
    const config2 = { services: [{ handlers: 42 }] }
    const config3 = { services: [{ handlers: true }] }
    const config4 = { services: [{ handlers: [] }] }
    const config5 = { services: [{ handlers: () => {} }] }
    const config6 = { services: [{ handlers: {} }] }
    const tests = [
      expect(checkConfig(config1 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config2 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config3 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config4 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config5 as unknown as UserCfg)).toBe(false),
      expect(checkConfig(config6 as unknown as UserCfg)).toBe(false),
    ]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })
})

describe('helpers.pApi.fillDefaultValues', () => {
  test('all empty values', () => {
    const config1: UserCfg = {
      services: [{ name: 'ga', scripts: [{ url: 'url' }] }],
    }
    const config2: UserCfg = {
      services: [{ name: 'ga', onInit: () => {} }],
    }
    const config3: UserCfg = {
      services: [{ name: 'ga', handlers: { trackingFn: () => {} } }],
    }
    expect(fillDefault(config1)).toEqual({
      enableRequiredCookies: true,
      services: [
        {
          name: config1.services[0].name,
          label: undefined,
          type: undefined,
          description: undefined,
          scripts: config1.services[0].scripts,
          onInit: undefined,
          handlers: undefined,
        },
      ],
    })
    expect(fillDefault(config2)).toEqual({
      enableRequiredCookies: true,
      services: [
        {
          name: config2.services[0].name,
          label: undefined,
          type: undefined,
          description: undefined,
          scripts: undefined,
          onInit: config2.services[0].onInit,
          handlers: undefined,
        },
      ],
    })
    expect(fillDefault(config3)).toEqual({
      enableRequiredCookies: true,
      services: [
        {
          name: config3.services[0].name,
          label: undefined,
          type: undefined,
          description: undefined,
          scripts: undefined,
          onInit: undefined,
          handlers: config3.services[0].handlers,
        },
      ],
    })
  })

  test('all filled values', () => {
    const config1: UserCfg = {
      enableRequiredCookies: true,
      services: [
        {
          name: 'ga',
          label: 'Google Analytics',
          type: 'Analytics',
          description: 'Google Analytics tool.',
          scripts: [{ url: 'url' }],
          onInit: () => {},
          handlers: {
            trackingFn: () => {},
          },
        },
      ],
    }
    expect(fillDefault(config1)).toEqual(config1)
  })

  test('optional field (enableRequiredCookies)', () => {
    const config1: UserCfg = {
      services: [{ name: 'ga', onInit: () => {} }],
    }
    expect(fillDefault(config1)).toEqual({
      enableRequiredCookies: true,
      ...config1,
    })
  })
})

describe('helpers.pApi.checkForValidServiceName', () => {
  test('valid service name', () => {
    const registered = ['ga', 'hotjar']
    expect(checkServiceName('ga', registered)).toBe(true)
  })

  test('invalid service name', () => {
    const registered = ['ga', 'hotjar']
    const tests = [expect(checkServiceName('matomo', registered)).toBe(false)]
    expect(global.console.error).toHaveBeenCalledTimes(tests.length)
  })
})
