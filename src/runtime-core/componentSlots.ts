import { ShapeFlags } from '../shared/ShapeFlags';

export function initSlots(instace, children) {
  // instace.slots = Array.isArray(children) ? children : [children];
  const { vnode } = instace;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeSlots(children, instace.slots);
  }
}

function normalizeSlots(children, slots) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotsValue(value(props));
  }
}

function normalizeSlotsValue(value) {
  return Array.isArray(value) ? value : [value];
}
