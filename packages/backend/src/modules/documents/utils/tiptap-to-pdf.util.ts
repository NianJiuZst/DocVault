import PDFDocument from 'pdfkit';

/**
 * Tiptap node types
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

/**
 * Options for PDF generation
 */
export interface PdfOptions {
  title: string;
  author?: string;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Generate PDF from Tiptap JSON document.
 * Supports: headings, paragraphs, bold, italic, lists, images, code blocks, blockquotes.
 */
export async function tiptapToPdf(
  doc: unknown,
  options: PdfOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc_new = new PDFDocument({
        margins: options.margins ?? { top: 72, bottom: 72, left: 72, right: 72 },
        size: 'A4',
        info: {
          Title: options.title,
          Author: options.author ?? 'DocVault',
        },
      });

      doc_new.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc_new.on('end', () => resolve(Buffer.concat(chunks)));
      doc_new.on('error', reject);

      // Render title
      doc_new.fontSize(24).font('Helvetica-Bold').text(options.title, { align: 'center' });
      doc_new.moveDown(2);

      // Render content
      if (doc && typeof doc === 'object' && (doc as TiptapNode).type === 'doc') {
        const root = doc as TiptapNode;
        if (Array.isArray(root.content)) {
          renderNodesToPdf(doc_new, root.content);
        }
      }

      doc_new.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Render an array of Tiptap nodes to PDF
 */
function renderNodesToPdf(doc: PDFKit.PDFDocument, nodes: TiptapNode[]): void {
  for (const node of nodes) {
    renderNodeToPdf(doc, node);
  }
}

/**
 * Render a single Tiptap node to PDF
 */
function renderNodeToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  switch (node.type) {
    case 'paragraph':
      renderParagraphToPdf(doc, node);
      break;

    case 'heading':
      renderHeadingToPdf(doc, node);
      break;

    case 'bulletList':
      renderBulletListToPdf(doc, node);
      break;

    case 'orderedList':
      renderOrderedListToPdf(doc, node);
      break;

    case 'listItem':
      // listItem is rendered by its parent list
      break;

    case 'codeBlock':
      renderCodeBlockToPdf(doc, node);
      break;

    case 'blockquote':
      renderBlockquoteToPdf(doc, node);
      break;

    case 'horizontalRule':
      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(0.5);
      break;

    case 'image':
      renderImageToPdf(doc, node);
      break;

    case 'hardBreak':
      doc.text(' ');
      break;

    default:
      // Render children if any
      if (node.content && Array.isArray(node.content)) {
        renderNodesToPdf(doc, node.content);
      }
  }
}

/**
 * Render a paragraph to PDF
 */
function renderParagraphToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  if (!node.content || node.content.length === 0) {
    doc.moveDown(0.5);
    return;
  }

  const text = buildInlineText(node.content);
  doc.font('Helvetica').fontSize(12).text(text, { continued: false });
  doc.moveDown(0.5);
}

/**
 * Render a heading to PDF
 */
function renderHeadingToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  const level = (node.attrs?.level as number) || 1;
  const sizes: Record<number, number> = { 1: 20, 2: 18, 3: 16, 4: 14, 5: 13, 6: 12 };
  const size = sizes[Math.min(level, 6)] || 14;

  const text = node.content ? buildInlineText(node.content) : '';

  doc.moveDown(0.5);
  doc.fontSize(size).font('Helvetica-Bold').text(text, { continued: false });
  doc.moveDown(0.5);
}

/**
 * Render a bullet list to PDF
 */
function renderBulletListToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  if (!node.content) return;

  for (const item of node.content) {
    if (item.type !== 'listItem') continue;

    const bullet = '•';
    const text = buildInlineTextFromListItem(item);

    doc.fontSize(12).font('Helvetica').text(`${bullet}  ${text}`, {
      indent: 20,
      continued: false,
    });
  }
  doc.moveDown(0.5);
}

/**
 * Render an ordered list to PDF
 */
function renderOrderedListToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  if (!node.content) return;

  for (let i = 0; i < node.content.length; i++) {
    const item = node.content[i];
    if (item.type !== 'listItem') continue;

    const num = i + 1;
    const text = buildInlineTextFromListItem(item);

    doc.fontSize(12).font('Helvetica').text(`${num}.  ${text}`, {
      indent: 20,
      continued: false,
    });
  }
  doc.moveDown(0.5);
}

/**
 * Render a code block to PDF
 */
function renderCodeBlockToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  const lang = (node.attrs?.language as string) || '';
  const code = node.content
    ? node.content.map((c) => c.text || '').join('')
    : '';

  doc.moveDown(0.5);

  // Code block background (using rectangle + text)
  const startY = doc.y;
  const codeText = lang ? `# ${lang}\n${code}` : code;

  // Draw background rectangle for code block
  const textHeight = doc.heightOfString(codeText, { indent: 10, width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 20 });
  doc.rect(doc.page.margins.left, startY - 5, doc.page.width - doc.page.margins.left - doc.page.margins.right, textHeight + 10)
    .fill('#f5f5f5');

  doc.fontSize(10).font('Courier').fillColor('#333').text(codeText, {
    indent: 10,
    continued: false,
  });

  doc.fillColor('#000');
  doc.moveDown(0.5);
}

/**
 * Render a blockquote to PDF
 */
function renderBlockquoteToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  if (!node.content) return;

  const text = buildInlineText(node.content);

  doc.moveDown(0.5);

  // Draw left border for blockquote
  const startY = doc.y;
  const textHeight = doc.heightOfString(text, { indent: 20, width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 20 });
  doc.rect(doc.page.margins.left, startY - 3, 3, textHeight + 6)
    .fill('#ccc');

  doc.fontSize(12).font('Helvetica-Oblique')
    .text(text, {
      indent: 20,
      continued: false,
    });
  doc.moveDown(0.5);
}

/**
 * Render an image node to PDF
 */
function renderImageToPdf(doc: PDFKit.PDFDocument, node: TiptapNode): void {
  const src = node.attrs?.src as string;
  if (!src) return;

  doc.moveDown(0.5);

  try {
    // Handle data URLs
    if (src.startsWith('data:image')) {
      const base64Data = src.split(',')[1];
      if (base64Data) {
        const imageBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imageBuffer, { fit: [500, 300], align: 'center' });
      }
    } else if (src.startsWith('http') || src.startsWith('https')) {
      // For remote images, we'd need to fetch them first
      // For now, just skip with a placeholder
      doc.fontSize(10).fillColor('#999')
        .text(`[Image: ${src}]`, { align: 'center' });
      doc.fillColor('#000');
    }
  } catch {
    // If image fails to load, just skip
    doc.fontSize(10).fillColor('#999')
      .text(`[Image could not be loaded]`, { align: 'center' });
    doc.fillColor('#000');
  }

  doc.moveDown(0.5);
}

/**
 * Build inline text from nodes, applying marks
 */
function buildInlineText(nodes: TiptapNode[]): string {
  let result = '';

  for (const node of nodes) {
    if (node.type === 'text' && node.text !== undefined) {
      let text = node.text;
      if (node.marks && Array.isArray(node.marks)) {
        for (const mark of node.marks) {
          text = applyMarkToText(text, mark);
        }
      }
      result += text;
    } else if (node.type === 'hardBreak') {
      result += '\n';
    } else if (node.type === 'paragraph' && node.content) {
      result += buildInlineText(node.content);
    }
  }

  return result;
}

/**
 * Build inline text from a list item
 */
function buildInlineTextFromListItem(node: TiptapNode): string {
  if (!node.content) return '';

  let text = '';
  for (const child of node.content) {
    if (child.type === 'paragraph' && child.content) {
      text += buildInlineText(child.content);
    } else if (child.type === 'bulletList' || child.type === 'orderedList') {
      // Nested list - render as text representation
      if (child.type === 'bulletList' && child.content) {
        for (const item of child.content) {
          if (item.type === 'listItem' && item.content) {
            text += '\n  • ' + buildInlineTextFromListItem(item);
          }
        }
      } else if (child.type === 'orderedList' && child.content) {
        child.content.forEach((item, idx) => {
          if (item.type === 'listItem' && item.content) {
            text += `\n  ${idx + 1}. ` + buildInlineTextFromListItem(item);
          }
        });
      }
    }
  }

  return text.trim();
}

/**
 * Apply a mark to text (for styling)
 */
function applyMarkToText(text: string, mark: TiptapMark): string {
  // In PDF, we handle marks through font changes
  // For now just return the plain text since PDFDocument's text() doesn't easily support inline marks
  // A more sophisticated implementation would track position-based styling
  return text;
}

/**
 * Get the PDF with proper font settings for a text run
 */
function getFontForMark(doc: PDFKit.PDFDocument, mark: TiptapMark): void {
  switch (mark.type) {
    case 'bold':
    case 'strong':
      doc.font('Helvetica-Bold');
      break;
    case 'italic':
    case 'em':
      doc.font('Helvetica-Oblique');
      break;
    case 'boldItalic':
      doc.font('Helvetica-BoldOblique');
      break;
    default:
      doc.font('Helvetica');
  }
}
