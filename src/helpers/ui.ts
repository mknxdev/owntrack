const NS = 'http://www.w3.org/2000/svg'

const getIconCloseElement = (): Element => {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('version', '1.1')
  svg.setAttribute('viewBox', '0 0 24 24')
  const l1 = document.createElementNS(NS, 'line')
  l1.setAttribute('x1', '1')
  l1.setAttribute('y1', '23')
  l1.setAttribute('x2', '23')
  l1.setAttribute('y2', '1')
  const l2 = document.createElementNS(NS, 'line')
  l2.setAttribute('x1', '1')
  l2.setAttribute('y1', '1')
  l2.setAttribute('x2', '23')
  l2.setAttribute('y2', '23')
  l1.setAttribute('stroke-width', '3')
  l2.setAttribute('stroke-width', '3')
  l1.setAttribute('stroke', '#000000')
  l2.setAttribute('stroke', '#000000')
  svg.append(l1)
  svg.append(l2)
  return svg
}

export const generateIconElement = (icon: string): Element => {
  return {
    close: getIconCloseElement(),
  }[icon]
}
