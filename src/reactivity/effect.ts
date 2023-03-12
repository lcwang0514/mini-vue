import { extend } from '../shared';

let activeEffect;
let shouldTrack;
export class ReactiveEffect {
  private _fn: any; // effect 的第一个fn参数
  deps = []; // 收集 收集当前实例的额依赖
  active = true; // 判断只需要清理一次的 flag, 防止 stop 函数多次触发
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  // run 方法执行时候，被proxy 的变量会收集依赖
  // 用 shouldTrack 来区分是否要收集变量
  run() {
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();

    shouldTrack = false;
    return result;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
/**
 * 收集依赖
 * @param target
 * @param key
 */
const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;
  // target ---> key ---> dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep); // 反向收集 deps
}

/**
 * 触发依赖
 * @param target
 * @param key
 */
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    // scheduler 等触发更新的时候才会执行
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // Object.assign(_effect, options);
  extend(_effect, options);
  // _effect.onStop = options.onStop;
  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner._effect = _effect;
  return runner;
}

export function stop(runner) {
  runner._effect.stop();
}
