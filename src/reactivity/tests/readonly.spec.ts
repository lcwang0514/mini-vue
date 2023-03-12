import { isReadonly, readonly, isProxy } from '../reactive';

describe('readonly', () => {
  it('happy path', () => {
    // 只读 不可修改
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    expect(wrapped.foo).toBe(1);
    expect(isProxy(wrapped)).toBe(true);
  });

  it('warn when call set', () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });

    user.age = 11;

    expect(console.warn).toBeCalled();
  });
});
