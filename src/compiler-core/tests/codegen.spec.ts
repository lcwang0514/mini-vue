import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
import { transformElement } from '../src/transfroms/transformElement';
import { transformExpression } from '../src/transfroms/transformExpression';
import { transformText } from '../src/transfroms/transformText';

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi');
    transform(ast);
    const { code } = generate(ast);
    // 快照
    //1 抓 bug
    // 2 有意更新
    expect(code).toMatchSnapshot();
  });

  it('interpolation', () => {
    const ast = baseParse('{{message}}');
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  it('element', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
