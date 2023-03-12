import { isReadonly, shallowReadonly } from '../reactive';

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactivel', () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  it('warn when call set', () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
      info: {
        name: 'ww',
      },
    });

    user.age = 11;
    user.info.name = 'hhh';

    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledTimes(1);
  });
});
