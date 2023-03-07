import { reactive } from '../reactive';
import { effect } from '../effect';
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });

  it('should return runner when call effect', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });

  it('Scheduler', () => {
    /**
     * 1. 通过 effect 的第二个参数给定一个  scheduler 的 函数
     * 2. effect 第一次执行的时候，还会执行 fn(effect 的第一个参数)
     * 3. 当响应式对象  set  更新（update) 的时候，不会执行 fn(effect 的第一个参数) ，而是执行 scheduler
     * 4. 当执行 runner 的时候，会再次执行 fn(effect 的第一个参数)
     */
    let dummy;
    let run;
    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // shoule be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    //
    expect(dummy).toBe(2);
  });
});
