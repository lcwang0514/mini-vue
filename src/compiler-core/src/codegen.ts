import { TO_DISPLAY_STRING, helpersMapName } from './runtimeHelpers';
import { NodeTypes } from './ast';

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  // 前导
  genFunctionPreamble(ast, context);

  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(', ');

  push(`function ${functionName}(${signature}){`);
  push(`return `);
  genNode(ast.codegenNode, context);
  push('}');
  return {
    code: context.code,
  };
}

function genFunctionPreamble(ast, context) {
  const { push } = context;
  const VueBinging = 'Vue';
  const aliasHelper = (s) => `${helpersMapName[s]}:_${helpersMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(`const {${ast.helpers.map(aliasHelper).join(', ')}} = ${VueBinging}`);
  }
  push('\n');
  push('return ');
}

function genNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(context, node);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(context, node);
      break;
    case NodeTypes.SIMPLE_INTERPOLATION:
      genExpression(context, node);
      break;
    default:
      break;
  }
}
function genText(context: any, node: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
function genInterpolation(context: any, node: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(')');
}

function genExpression(context: any, node: any) {
  const { push } = context;
  push(`${node.content}`);
}

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helpersMapName[key]}`;
    },
  };
  return context;
}
