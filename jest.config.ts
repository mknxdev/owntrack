import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@src(.*)$': '<rootDir>/src$1',
  },
}

export default config
