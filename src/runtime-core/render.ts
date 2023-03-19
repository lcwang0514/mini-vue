import { ShapeFlags } from '../shared/ShapeFlags';
import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';

export function render(vnode, container, parentComponent) {
  // patch
  patch(vnode, container, parentComponent);
}

function patch(vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVnode, container, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container, instance);
  initialVnode.el = subTree.el;
}
function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent);
}
function mountElement(vnode: any, container: any, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }

  const { props } = vnode;
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  for (const key in props) {
    const val = props[key];
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }

  container.append(el);
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent);
  });
}
function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
