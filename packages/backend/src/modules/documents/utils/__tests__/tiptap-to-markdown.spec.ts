import { tiptapToMarkdown, markdownToTiptap } from '../tiptap-to-markdown.util';

describe('tiptapToMarkdown', () => {
  it('should convert a simple paragraph', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] },
      ],
    };
    expect(tiptapToMarkdown(doc)).toBe('Hello World');
  });

  it('should convert headings', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Subtitle' }] },
      ],
    };
    expect(tiptapToMarkdown(doc)).toBe('# Title\n\n## Subtitle');
  });

  it('should convert bullet lists', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
            },
          ],
        },
      ],
    };
    expect(tiptapToMarkdown(doc)).toBe('- Item 1\n\n- Item 2');
  });

  it('should convert ordered lists', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }],
            },
          ],
        },
      ],
    };
    expect(tiptapToMarkdown(doc)).toBe('1. First\n\n2. Second');
  });

  it('should convert code blocks with language', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [{ type: 'text', text: 'const x = 1;' }],
        },
      ],
    };
    expect(tiptapToMarkdown(doc)).toBe('```javascript\nconst x = 1;\n```');
  });

  it('should convert blockquotes', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A quote' }] }],
        },
      ],
    };
    expect(tiptapToMarkdown(doc)).toBe('> A quote');
  });

  it('should convert horizontal rules', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'horizontalRule' }],
    };
    expect(tiptapToMarkdown(doc)).toBe('---');
  });

  it('should handle bold and italic marks', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    };
    const result = tiptapToMarkdown(doc);
    expect(result).toContain('**bold**');
    expect(result).toContain('*italic*');
  });

  it('should return empty string for null/undefined doc', () => {
    expect(tiptapToMarkdown(null)).toBe('');
    expect(tiptapToMarkdown(undefined)).toBe('');
  });

  it('should return empty string for non-doc root', () => {
    expect(tiptapToMarkdown({ type: 'paragraph' })).toBe('');
  });
});

describe('markdownToTiptap', () => {
  it('should parse a simple paragraph', () => {
    const result = markdownToTiptap('Hello World');
    expect(result.type).toBe('doc');
    expect(result.content).toBeDefined();
    expect(result.content!.length).toBeGreaterThan(0);
  });

  it('should parse headings', () => {
    const result = markdownToTiptap('# Title\n\n## Subtitle');
    const headings = result.content!.filter((n) => n.type === 'heading');
    expect(headings.length).toBe(2);
    expect((headings[0] as any).attrs.level).toBe(1);
    expect((headings[1] as any).attrs.level).toBe(2);
  });

  it('should parse bullet lists', () => {
    const result = markdownToTiptap('- Item 1\n- Item 2');
    const list = result.content!.find((n) => n.type === 'bulletList');
    expect(list).toBeDefined();
    expect((list as any).content.length).toBe(2);
  });

  it('should parse ordered lists', () => {
    const result = markdownToTiptap('1. First\n2. Second');
    const list = result.content!.find((n) => n.type === 'orderedList');
    expect(list).toBeDefined();
    expect((list as any).content.length).toBe(2);
  });

  it('should parse blockquotes', () => {
    const result = markdownToTiptap('> A quote');
    const bq = result.content!.find((n) => n.type === 'blockquote');
    expect(bq).toBeDefined();
  });

  it('should parse code blocks', () => {
    const result = markdownToTiptap('```javascript\nconst x = 1;\n```');
    const cb = result.content!.find((n) => n.type === 'codeBlock');
    expect(cb).toBeDefined();
    expect((cb as any).attrs.language).toBe('javascript');
  });

  it('should parse horizontal rules', () => {
    const result = markdownToTiptap('---');
    const hr = result.content!.find((n) => n.type === 'horizontalRule');
    expect(hr).toBeDefined();
  });

  it('should handle empty string', () => {
    const result = markdownToTiptap('');
    expect(result.type).toBe('doc');
    expect(result.content).toEqual([]);
  });

  it('should parse inline bold (**text**)', () => {
    const result = markdownToTiptap('This is **bold** text');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const boldNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'bold'));
    expect(boldNode).toBeDefined();
    expect(boldNode.text).toBe('bold');
  });

  it('should parse inline italic (*text*)', () => {
    const result = markdownToTiptap('This is *italic* text');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const italicNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'italic'));
    expect(italicNode).toBeDefined();
    expect(italicNode.text).toBe('italic');
  });

  it('should parse inline code (`text`)', () => {
    const result = markdownToTiptap('Use `console.log()`');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const codeNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'code'));
    expect(codeNode).toBeDefined();
    expect(codeNode.text).toBe('console.log()');
  });

  it('should parse boldItalic (***text***)', () => {
    const result = markdownToTiptap('***boldItalic***');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const biNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'bold'));
    expect(biNode).toBeDefined();
    expect(biNode.marks.length).toBe(2); // both bold and italic
  });

  it('should parse strike (~~text~~)', () => {
    const result = markdownToTiptap('~~deleted~~');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const strikeNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'strike'));
    expect(strikeNode).toBeDefined();
    expect(strikeNode.text).toBe('deleted');
  });

  it('should parse underline (<u>text</u>)', () => {
    const result = markdownToTiptap('<u>underlined</u>');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const uNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'underline'));
    expect(uNode).toBeDefined();
    expect(uNode.text).toBe('underlined');
  });

  it('should parse highlight (==text==)', () => {
    const result = markdownToTiptap('==highlighted==');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    const hlNode = para.content!.find((n: any) => n.type === 'text' && n.marks?.some((m: any) => m.type === 'highlight'));
    expect(hlNode).toBeDefined();
    expect(hlNode.text).toBe('highlighted');
  });

  it('should handle mixed inline formatting in one paragraph', () => {
    const result = markdownToTiptap('**bold** and *italic* and `code`');
    const para = result.content!.find((n) => n.type === 'paragraph') as any;
    expect(para).toBeDefined();
    expect(para.content!.length).toBe(5); // bold, ' and ', italic, ' and ', code
  });
});
