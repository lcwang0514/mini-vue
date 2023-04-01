import { NodeTypes } from './ast';

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parserChildren(context, []));
}

function parserChildren(context, ancestors) {
  const nodes: any = [];

  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    if (s.startsWith('{{')) {
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    // 不是插值，也不是element 当做 text
    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }
  return nodes;
}

function isEnd(context, ancestors) {
  // 遇到结束标签
  const s = context.source;
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startWithEndTagOpen(s, tag)) {
        // if (s.slice(2, 2 + tag.length) === tag) {
        return true;
      }
    }
  }
  // if (ancestors && s.startsWith(`</${ancestors}>`)) {
  //   return true;
  // }
  // source 有值
  return !s;
}

function parseText(context: any) {
  let endIndex = context.source.length;
  let endTokens = ['<', '{{'];

  for (let i = 0; i < endTokens.length; i++) {
    const idx = context.source.indexOf(endTokens[i]);
    if (idx !== -1 && endIndex > idx) {
      endIndex = idx;
    }
  }
  // 1 获取 content
  const content = parseTextData(context, endIndex);
  // 2 推进
  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context: any, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, content.length);
  return content;
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parserChildren(context, ancestors);
  ancestors.pop();
  if (startWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End); // 删除 </div>
  } else {
    throw new Error(`缺少结束标签：${element.tag}`);
  }
  return element;
}

function startWithEndTagOpen(source, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
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
  // const rawContent = context.source.slice(0, rawContentLength);
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  // console.log('content -----------', content); message
  // 把已经处理过的删除掉
  context.source = context.source.slice(closeDelimiter.length);

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
