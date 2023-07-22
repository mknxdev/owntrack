import { test, expect } from '@jest/globals'
import {
  createElmt,
  generateIconElement,
  getLogoElement,
} from '@src/helpers/ui'

describe('helpers.ui.getLogoElement', () => {
  test('valid element', () => {
    const logo = getLogoElement()
    expect(logo instanceof Element).toBe(true)
    expect(logo.tagName.toLowerCase()).toBe('svg')
    expect(logo.classList.contains('ot-logo')).toBe(true)
  })
})

describe('helpers.ui.createElmt', () => {
  test('valid element', () => {
    const el1 = createElmt('div')
    expect(el1 instanceof Element).toBe(true)
    expect(el1.tagName.toLowerCase()).toBe('div')
    const el2 = createElmt('div', ['test-class'])
    expect(el2.classList.contains('test-class')).toBe(true)
    const el3 = createElmt('div', ['test-class', 'another-test-class'])
    expect(el3.classList.contains('test-class')).toBe(true)
    expect(el3.classList.contains('another-test-class')).toBe(true)
    const el4 = createElmt('div', [], { attr: '' })
    expect(el4.hasAttribute('attr')).toBe(true)
    expect(el4.getAttribute('attr') === '').toBe(true)
    const el5 = createElmt('div', [], { attr: 'test-attr' })
    expect(el5.getAttribute('attr') === 'test-attr').toBe(true)
    const el6 = createElmt('div', [], {
      attr1: '',
      attr2: 'test-attr',
    })
    expect(el6.hasAttribute('attr1')).toBe(true)
    expect(el6.hasAttribute('attr2')).toBe(true)
    expect(el6.getAttribute('attr1') === '').toBe(true)
    expect(el6.getAttribute('attr2') === 'test-attr').toBe(true)
  })
})

describe('helpers.ui.generateIconElement', () => {
  test('[close] valid element', () => {
    const icnClose = generateIconElement('close')
    expect(icnClose instanceof Element).toBe(true)
    expect(icnClose.tagName.toLowerCase()).toBe('svg')
    expect(icnClose.classList.contains('ot-icn')).toBe(true)
  })
})
