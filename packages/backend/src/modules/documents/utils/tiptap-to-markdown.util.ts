/**
 * Converts Tiptap JSON document structure to Markdown format.
 *
 * Supported node types:
 * - doc, paragraph, heading, text
 * - bulletList, orderedList, listItem
 * - codeBlock, code (inline)
 * - blockquote
 * - horizontalRule
 * - hardBreak
 * - bold, italic, strike, underline, code (marks)
 * - hardBreak
 *
 * Unsupported (stored as plain text):
 * - images, tables, YouTube embeds, task lists
 */

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

const BLOCK_SEPARATOR = "\n\n";
const HR = "---";

/**
 * Convert a Tiptap JSON document to Markdown string.
 */
export function tiptapToMarkdown(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";

  const node = doc as TiptapNode;
  if (node.type !== "doc" || !Array.isArray(node.content)) {
    return "";
  }

  return renderNodes(node.content);
}

/**
 * Convert a Markdown string to a Tiptap JSON document.
 */
export function markdownToTiptap(markdown: string): TiptapNode {
  const lines = markdown.split("\n");
  const content: TiptapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === "") {
      i++;
      continue;
    }

    // Heading: # to ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      content.push({
        type: "heading",
        attrs: { level },
        content: [textNode(text)],
      });
      i++;
      continue;
    }

    // Unordered list item: - or * or +
    if (/^[-*+]\s/.test(trimmed)) {
      const items: TiptapNode[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*+]\s/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [textNode(itemText)],
            },
          ],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Ordered list item: 1. 2. etc.
    if (/^\d+\.\s/.test(trimmed)) {
      const items: TiptapNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [textNode(itemText)],
            },
          ],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith("> ")) {
      const paragraphs: TiptapNode[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        const text = lines[i].trim().replace(/^>\s?/, "");
        if (text) {
          paragraphs.push({
            type: "paragraph",
            content: [textNode(text)],
          });
        }
        i++;
      }
      if (paragraphs.length > 0) {
        content.push({ type: "blockquote", content: paragraphs });
      }
      continue;
    }

    // Fenced code block: ``` or ~~~
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      const fence = trimmed.slice(0, 3);
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      content.push({
        type: "codeBlock",
        attrs: lang ? { language: lang } : undefined,
        content: [textNode(codeLines.join("\n"))],
      });
      i++; // skip closing fence
      continue;
    }

    // Horizontal rule: --- or *** or ___
    if (/^(---|\*\*\*|___)\s*$/.test(trimmed)) {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Regular paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !/^[-*+]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("> ") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("~~~") &&
      !/^(---|\*\*\*|___)\s*$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join(" ").trim();
      if (paragraphText) {
        const inlineNodes = parseInlineFormatting(paragraphText);
        content.push({
          type: "paragraph",
          content: inlineNodes,
        });
      }
    }
  }

  return { type: "doc", content };
}

/**
 * Parse inline Markdown formatting into Tiptap nodes with marks.
 * Handles: **bold**, *italic*, `code`, ~~strike~~, <u>underline</u>, ==highlight==
 */
function parseInlineFormatting(text: string): TiptapNode[] {
  const nodes: TiptapNode[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|~~(.+?)~~|<u>(.+?)<\/u>|==(.+?)==)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add any plain text before this match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      if (plainText) {
        nodes.push(textNode(plainText));
      }
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('***') && fullMatch.endsWith('***')) {
      // boldItalic
      nodes.push(textNode(match[2], [{ type: 'bold' }, { type: 'italic' }]));
    } else if (fullMatch.startsWith('**') && fullMatch.endsWith('**')) {
      // bold
      nodes.push(textNode(match[3], [{ type: 'bold' }]));
    } else if (fullMatch.startsWith('*') && fullMatch.endsWith('*')) {
      // italic
      nodes.push(textNode(match[4], [{ type: 'italic' }]));
    } else if (fullMatch.startsWith('`') && fullMatch.endsWith('`')) {
      // inline code
      nodes.push(textNode(match[5], [{ type: 'code' }]));
    } else if (fullMatch.startsWith('~~') && fullMatch.endsWith('~~')) {
      // strike
      nodes.push(textNode(match[6], [{ type: 'strike' }]));
    } else if (fullMatch.startsWith('<u>') && fullMatch.endsWith('</u>')) {
      // underline
      nodes.push(textNode(match[7], [{ type: 'underline' }]));
    } else if (fullMatch.startsWith('==') && fullMatch.endsWith('==')) {
      // highlight
      nodes.push(textNode(match[8], [{ type: 'highlight' }]));
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      nodes.push(textNode(remaining));
    }
  }

  // If no formatting found, return single text node
  if (nodes.length === 0) {
    nodes.push(textNode(text));
  }

  return nodes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendering (Tiptap JSON → Markdown)
// ─────────────────────────────────────────────────────────────────────────────

function renderNodes(nodes: TiptapNode[]): string {
  return nodes.map(renderNode).filter(Boolean).join(BLOCK_SEPARATOR);
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    case "paragraph":
      return renderParagraph(node);

    case "heading":
      return renderHeading(node);

    case "bulletList":
      return renderBulletList(node);

    case "orderedList":
      return renderOrderedList(node);

    case "listItem":
      return renderListItem(node);

    case "codeBlock":
      return renderCodeBlock(node);

    case "blockquote":
      return renderBlockquote(node);

    case "horizontalRule":
      return HR;

    case "hardBreak":
      return "  \n";

    // Leaf nodes that have no content
    case "image":
      return "";

    default:
      // Try to render children if any
      if (node.content && Array.isArray(node.content)) {
        return renderNodes(node.content);
      }
      return "";
  }
}

function renderParagraph(node: TiptapNode): string {
  if (!node.content || node.content.length === 0) return "";
  return renderInlines(node.content);
}

function renderHeading(node: TiptapNode): string {
  const level = (node.attrs?.level as number) || 1;
  const text = node.content ? renderInlines(node.content) : "";
  return "#".repeat(Math.min(level, 6)) + " " + text;
}

function renderBulletList(node: TiptapNode): string {
  if (!node.content) return "";
  return node.content
    .filter((child) => child.type === "listItem")
    .map((item) => renderListItem(item, false))
    .join(BLOCK_SEPARATOR);
}

function renderOrderedList(node: TiptapNode): string {
  if (!node.content) return "";
  return node.content
    .filter((child) => child.type === "listItem")
    .map((item, idx) => renderListItem(item, true, idx + 1))
    .join(BLOCK_SEPARATOR);
}

function renderListItem(
  node: TiptapNode,
  ordered = false,
  index = 0,
): string {
  if (!node.content) return "";

  const prefix = ordered ? `${index}. ` : "- ";
  const contents = node.content
    .map((child) => {
      if (child.type === "paragraph" && child.content) {
        // First paragraph content goes inline after prefix
        const text = child.content.map(inlineNodeToString).join("");
        return prefix + text;
      }
      // Nested lists
      if (
        child.type === "bulletList" ||
        child.type === "orderedList"
      ) {
        const rendered = child.type === "bulletList"
          ? renderBulletList(child)
          : renderOrderedList(child);
        // Indent nested list
        return rendered
          .split("\n")
          .map((line) => "  " + line)
          .join("\n");
      }
      return renderNode(child);
    })
    .join(BLOCK_SEPARATOR);

  return contents;
}

function renderCodeBlock(node: TiptapNode): string {
  const lang = (node.attrs?.language as string) || "";
  const code = node.content
    ? node.content.map((c) => c.text || "").join("")
    : "";
  const fence = "```";
  return `${fence}${lang}\n${code}\n${fence}`;
}

function renderBlockquote(node: TiptapNode): string {
  if (!node.content) return "";
  return node.content
    .map((child) => {
      if (child.content) {
        const text = child.content.map(inlineNodeToString).join("");
        return "> " + text;
      }
      return "";
    })
    .filter(Boolean)
    .join(BLOCK_SEPARATOR);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline rendering
// ─────────────────────────────────────────────────────────────────────────────

function renderInlines(nodes: TiptapNode[]): string {
  return nodes.map(inlineNodeToString).join("");
}

function inlineNodeToString(node: TiptapNode): string {
  if (node.type === "text" && node.text !== undefined) {
    let text = node.text;
    if (node.marks && Array.isArray(node.marks)) {
      for (const mark of node.marks) {
        text = applyMark(text, mark);
      }
    }
    return text;
  }
  if (node.type === "hardBreak") return "  \n";
  if (node.type === "paragraph" && node.content) {
    return renderInlines(node.content);
  }
  return "";
}

function applyMark(text: string, mark: TiptapMark): string {
  switch (mark.type) {
    case "bold":
    case "strong":
      return `**${text}**`;
    case "italic":
    case "em":
      return `*${text}*`;
    case "strike":
    case "s":
      return `~~${text}~~`;
    case "underline":
      return `<u>${text}</u>`;
    case "code":
      return `\`${text}\``;
    case "highlight":
      return `==${text}==`;
    default:
      return text;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown → Tiptap helpers
// ─────────────────────────────────────────────────────────────────────────────

function textNode(text: string, marks?: TiptapMark[]): TiptapNode {
  return {
    type: "text",
    text,
    ...(marks && marks.length > 0 ? { marks } : {}),
  };
}
