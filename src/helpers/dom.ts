export const findElementChildByAttr = (
  el: Element,
  attr: string,
  attrVal = '',
): Element | null => {
  let found: Element | null = null
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i]
    const hasAttr = child.hasAttribute(attr)
    const childAttrVal = child.getAttribute(attr)
    if (hasAttr && (!attrVal || (attrVal && childAttrVal === attrVal)))
      found = child
    else if (!found) found = findElementChildByAttr(child, attr, attrVal)
  }
  return found
}

export const findElementChildByClass = (
  el: Element,
  _class: string,
): Element | null => {
  let found: Element | null = null
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i]
    if (child.classList.contains(_class)) found = child
    else if (!found) found = findElementChildByClass(child, _class)
  }
  return found
}
