import { NodeTypes } from './ast';

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parserChildren(context));
}

function parserChildren(context) {
  const nodes: any = [];

  let node;
  const s = context.source;
  if (s.startsWith('{{')) {
    node = parseInterpolation(context);
  } else if (s[0] === '<') {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  nodes.push(node);
  return nodes;
}

function parseElement(context) {
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End); // 删除 </div>
  return element;
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
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
