import { NodeTypes } from '../ast';

export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
    // const rawContent = node.content.content;
    // node.content = node;
  }
}
function processExpression(node) {
  node.content = `_ctx.${node.content}`;
  return node;
}
