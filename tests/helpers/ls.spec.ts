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
    setItem('item', 'test_value')
    expect(getItem('item')).toBeTruthy()
    expect(getItem('item')).toBe('test_value')
  })
})

describe('helpers.ls.getItem', () => {
  test('valid processing', () => {
    setItem('item1', 'test_value1')
    setItem('item2', true)
    setItem('item3', 42)
    setItem('item4', [42, 'value', true])
    setItem('item5', { test: 'test_value' })
    expect(getItem('item1')).toBe('test_value1')
    expect(getItem('item2')).toBe(true)
    expect(getItem('item3')).toBe(42)
    expect(getItem('item4')).toEqual([42, 'value', true])
    expect(getItem('item5')).toEqual({ test: 'test_value' })
  })
})

describe('helpers.ls.removeItem', () => {
  test('valid processing', () => {
    setItem('item', 'test_value')
    removeItem('item')
    expect(getItem('item')).toBeFalsy()
  })
})
