import { NodeTypes } from './ast';

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parserChildren(context));
}

function parserChildren(context) {
  const nodes: any = [];
  let node;
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context);
  }

  nodes.push(node);
  return nodes;
}

function parseInterpolation(context) {
  const openDelimiter = '{{';
  const closeDelimiter = '}}';
  //  {{message}}
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  // context.source = context.source.slice();
  advanceBy(context, openDelimiter.length);
  // console.log('count', context.source); message}}
  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();

  // console.log('content -----------', content); message
  // 把已经处理过的删除掉
  context.source = context.source.slice(
    rawContentLength + closeDelimiter.length
  );

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_INTERPOLATION,
      content: content,
    },
  };
}
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

function createParserContext(content: string): any {
  return {
    source: content,
  };
}
