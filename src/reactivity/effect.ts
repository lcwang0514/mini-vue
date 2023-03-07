import { extend } from '../shared';

class ReactiveEffect {
  private _fn: any; // effect 的第一个fn参数
  deps = []; // 收集 收集当前实例的额依赖
  active = true; // 判断只需要清理一次的 flag
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();
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
}
/**
 * 收集依赖
 * @param target
 * @param key
 */
const targetMap = new Map();
export function track(target, key) {
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

  if (!activeEffect) return;

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

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

let activeEffect;
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
