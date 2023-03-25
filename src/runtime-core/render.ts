import { effect } from '../reactivity/effect';
import { EMPTY_OBJ } from '../shared';
import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { createAppApi } from './createApp';
import { Fragment, Text } from './vnode';

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null, null);
  }

  /**
   *
   * @param n1 老的虚拟节点
   * @param n2 新的节点
   * @param container 容器
   * @param parentComponent 父组件
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(initialVnode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container, anchor);
  }
  function setupRenderEffect(instance: any, initialVnode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init');
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);
        initialVnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log('update');
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(preSubTree, subTree, container, instance, anchor);
      }
    });
  }
  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('n1', n1);
    console.log('n2', n2);

    // props
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
    // children
    patchChildren(n1, n2, el, parentComponent, anchor);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const c1 = n1.children;
    const shapeFlag = n2.shapeFlag;
    const c2 = n2.children;
    /**
     * 新的节点是文本
     */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的节点是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 把老的 children 清空
        unMountChildren(n1.children);
        // 设置 text
      }
      // 新的节点是文本，老的节点是array 或 文本 都比对更新
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // 新的是数组节点 老的是文本节点
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 清空老的节点
        hostSetElementText(container, '');
        // 挂载新的数组节点
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // 新的是数组， 老的也是数组
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  /**
   *
   * @param c1 老的节点
   * @param c2 新的节点
   * @param container
   * @param parentComponent
   */
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    function isSameVNodeType(n1, n2) {
      // 检测 type  和 key 判断是否一样
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 对比左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    // 对比右侧 i 不变
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 新的比老得多， 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = c2[nextPos]?.el || null;
        // 插入多个元素的时候
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    }

    // 新的比老的少 删除 老的节点
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    }
    // 乱序的部分
    else {
      // 中间对比
      let s1 = i; // 老节点开始
      let s2 = i; // 新节点的开始
      let toBePatched = e2 - s2 + 1; // 需要更新的数量
      let patched = 0; // 已经更新的数量

      // 建立新节点映射
      const keyToNewIndexMap = new Map();
      // 存储新节点在旧节点中的索引
      const newIndexToOldIndexMap = new Array(toBePatched);
      // 是否需要移动
      let isNeedMove = false;
      // 当前最大的 newIndex
      let maxNewIndexSoFar = 0;

      for (let i = 0; i < toBePatched; i++) {
        // 初始化
        newIndexToOldIndexMap[i] = 0;
      }

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        // 优化的点
        if (patched >= toBePatched) {
          // 所有的都已经更新完，后边的不需要执行
          hostRemove(prevChild.el); // 而当前老的节点还有，直接删除
          continue;
        }
        let newIndex;
        // null undefined
        if (prevChild.key != null) {
          // 没有定义key
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          // 新的节点没在旧的节点查找到，直接删除旧节点
          hostRemove(prevChild.el);
        } else {
          // 性能优化，如果所有新的子节点
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            isNeedMove = true;
          }
          // 查找到，更新
          // 设置新节点在旧节点中的位置
          newIndexToOldIndexMap[newIndex - s2] = i + 1; // 因为初始化为 0 ，表示没有创建元素 而 i 有可能为 0，所以加 1 区分
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      // 如果有需要移动再去获取最大递增子序列
      const increasingNewIndexSequence = isNeedMove
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          // 0 表示旧节点中没有，需要创建
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (isNeedMove) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            console.log('需要移动位置');
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unMountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  /**
   *
   * @param el dom 元素
   * @param oldProps 老节点
   * @param newProps 新节点
   */
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    // 多平台
    const el = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }

    //
    hostInsert(el, container, anchor);
    // container.append(el);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }
  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  return {
    createApp: createAppApi(render),
  };
}

function getTopEle(arr) {
  if (!arr.length) return 0;
  return arr[arr.length - 1];
}

function findNextEle(arr, n) {
  // 判断大小用 >= ，即不替换栈顶元素
  return arr.findIndex((item) => item >= n);
}

function getSequence(nums: number[]): number[] {
  // return [1, 2];
  let stack: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    // 数组为空直接入栈，不为空则获取栈顶元素判断大小
    if (stack.length == 0 || getTopEle(stack) < nums[i]) {
      stack.push(nums[i]);
    } else {
      let index = findNextEle(stack, nums[i]);
      stack[index] = nums[i];
    }
  }
  return stack;
}
