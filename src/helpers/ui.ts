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
  svg.classList.add('ot-icn')
  return svg
}

export const getLogoElement = (): Element => {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('version', '1.1')
  svg.setAttribute('viewBox', '0 0 1282.93 709.16')
  const p1 = document.createElementNS(NS, 'polygon')
  const p2 = document.createElementNS(NS, 'polygon')
  p1.setAttribute('points', '501.45 0 207.71 0 0 207.71 0 501.45 207.71 709.16 501.45 709.16 709.16 501.45 709.16 207.71 501.45 0')
  p1.setAttribute('fill', '#88181a')
  p2.setAttribute('points', '1282.93 131.04 1150.56 0 646.02 0 778.38 131.04 915.5 131.04 915.5 709.16 1046.54 576.8 1046.54 131.04 1282.93 131.04')
  p2.setAttribute('fill', '#6e6e6e')
  svg.append(p1)
  svg.append(p2)
  svg.classList.add('ot-logo')
  return svg
}

export const createElmt = (
  tag: string,
  classes: string[] = [],
  attrs: object = {},
) => {
  const element: Element = document.createElement(tag)
  for (const c of classes) element.classList.add(c)
  for (const [attr, val] of Object.entries(attrs))
    element.setAttribute(attr, val)
  return element
}

export const generateIconElement = (icon: string): Element => {
  return {
    close: getIconCloseElement(),
  }[icon]
}
