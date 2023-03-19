import { getCurrentInstance } from './component';

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    // 因为 provides 默认取值为父组件的 provides ，因此直接修改会把父组件的相同属性也修改掉,所以需要隔离
    // provides[key] = value;
    const parentProvides = currentInstance.parent.provides;
    if (provides === parentProvides) {
      // 初始化的时候才执行 防止多次 执行修改原型
      provides = currentInstance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}

/**
 *
 * @param key
 * @param defaultValue  默认值 string | () => string
 * @returns
 */
export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
