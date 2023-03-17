import { camelize, toHandlerKey } from '../shared/index';

export function emit(instance, event, ...args) {
  const { props } = instance;

  // TPP
  // 先写一个特定的行为， 重构成通用的行为
  //

  /**
   * 转换驼峰
   * add-foo  ---> addFoo
   * @param str
   * @returns
   */
  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}
