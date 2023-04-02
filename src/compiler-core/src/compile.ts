import { generate } from './codegen';
import { baseParse } from './parse';
import { transform } from './transform';
import { transformElement } from './transfroms/transformElement';
import { transformExpression } from './transfroms/transformExpression';
import { transformText } from './transfroms/transformText';

export function baseCompile(template) {
  const ast = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  });

  return generate(ast);
}
