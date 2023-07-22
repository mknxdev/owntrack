import { test, expect } from '@jest/globals'
import { setItem, getItem, removeItem } from '@src/helpers/ls'

const lsMock = (function () {
  let store = {}
  return {
    getItem(key) {
      return store[key]
    },
    setItem(key, value) {
      store[key] = value
    },
    clear() {
      store = {}
    },
    removeItem(key) {
      delete store[key]
    },
    getAll() {
      return store
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: lsMock })

afterEach(() => {
  lsMock.clear()
})

describe('helpers.ls.setItem', () => {
  test('valid processing', () => {
    setItem('test_item', 'test_value')
    expect(getItem('test_item')).toBeTruthy()
    expect(getItem('test_item')).toBe('test_value')
  })
})

describe('helpers.ls.getItem', () => {
  test('valid processing', () => {
    setItem('test_item1', 'test_value1')
    setItem('test_item2', 'test_value2')
    expect(getItem('test_item1')).toBeTruthy()
    expect(getItem('test_item1')).toBe('test_value1')
    expect(getItem('test_item2')).toBeTruthy()
    expect(getItem('test_item2')).toBe('test_value2')
  })
})

describe('helpers.ls.removeItem', () => {
  test('valid processing', () => {
    setItem('test_item', 'test_value')
    removeItem('test_item')
    expect(getItem('test_item')).toBeFalsy()
  })
})
