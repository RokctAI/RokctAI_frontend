/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */


// A small markdown reader for the shell's prose (corporate_sdk 1.1.0):
// `data/about.md` is a markdown string (base_sdk 1.35.0's `about` kind),
// and the composed shells carry no markdown dependency, so this is the
// subset a company page needs, parsed to a tree of blocks that
// markdown.tsx renders as React elements - never as HTML. Raw HTML in the
// source is text, a link whose target is not http(s), mailto, tel or a
// site path is rendered as its text, and nothing here reads the DOM.
//
// Blocks: ATX headings (# to ######), paragraphs, unordered (-, *, +) and
// ordered (1.) lists, blockquotes (>), fenced code (```), horizontal
// rules (---, ***). Inline: **strong**, *emphasis* (or _emphasis_),
// `code`, [text](href). Anything else is the text it is.
//
// Pure, dependency-free, no "server-only": the node tests execute it.

export type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; children: MarkdownInline[] }
  | { type: "em"; children: MarkdownInline[] }
  | { type: "link"; href: string; children: MarkdownInline[] };

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: MarkdownInline[] }
  | { type: "paragraph"; children: MarkdownInline[] }
  | { type: "list"; ordered: boolean; items: MarkdownInline[][] }
  | { type: "quote"; children: MarkdownInline[] }
  | { type: "code"; text: string }
  | { type: "rule" };

/** The link targets a page renders as links; anything else is text. */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

export function isSafeHref(href: string): boolean {
  return SAFE_HREF.test(href.trim());
}

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const UNORDERED = /^[-*+]\s+(.*)$/;
const ORDERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const FENCE = /^```/;
const RULE = /^(?:-{3,}|\*{3,}|_{3,})\s*$/;

/** The index of the ")" closing a link target that starts at `from`, or -1. */
function linkEnd(text: string, from: number): number {
  let depth = 0;
  for (let i = from; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      if (depth === 0) return i;
      depth -= 1;
    }
  }
  return -1;
}

/** Inline markup in one run of text. */
export function parseInline(text: string): MarkdownInline[] {
  const out: MarkdownInline[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) out.push({ type: "text", text: buffer });
    buffer = "";
  };
  let i = 0;
  while (i < text.length) {
    const rest = text.slice(i);
    // `code` - no markup inside.
    if (rest.startsWith("`")) {
      const end = rest.indexOf("`", 1);
      if (end > 0) {
        flush();
        out.push({ type: "code", text: rest.slice(1, end) });
        i += end + 1;
        continue;
      }
    }
    // **strong**
    if (rest.startsWith("**")) {
      const end = rest.indexOf("**", 2);
      if (end > 2) {
        flush();
        out.push({ type: "strong", children: parseInline(rest.slice(2, end)) });
        i += end + 2;
        continue;
      }
    }
    // *em* or _em_ (a single marker, not touching a space on the inside).
    if ((rest.startsWith("*") || rest.startsWith("_")) && rest[1] !== " " && rest[1] !== undefined) {
      const marker = rest[0];
      const end = rest.indexOf(marker, 1);
      if (end > 1 && rest[end - 1] !== " ") {
        flush();
        out.push({ type: "em", children: parseInline(rest.slice(1, end)) });
        i += end + 1;
        continue;
      }
    }
    // [text](href) - the target ends at the ")" that closes "(", so a
    // target carrying its own parentheses is read whole.
    if (rest.startsWith("[")) {
      const close = rest.indexOf("](");
      const end = close > 0 ? linkEnd(rest, close + 2) : -1;
      if (close > 0 && end > close) {
        const label = rest.slice(1, close);
        const href = rest.slice(close + 2, end).trim();
        flush();
        if (isSafeHref(href)) {
          out.push({ type: "link", href, children: parseInline(label) });
        } else {
          out.push(...parseInline(label));
        }
        i += end + 1;
        continue;
      }
    }
    buffer += text[i];
    i += 1;
  }
  flush();
  return out;
}

/** The document as blocks. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ").trim()) });
    paragraph = [];
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "") {
      flushParagraph();
      i += 1;
      continue;
    }
    if (FENCE.test(trimmed)) {
      flushParagraph();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i].trim())) {
        code.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "code", text: code.join("\n") });
      i += 1;
      continue;
    }
    if (RULE.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "rule" });
      i += 1;
      continue;
    }
    const heading = HEADING.exec(trimmed);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(heading[2]),
      });
      i += 1;
      continue;
    }
    if (UNORDERED.test(trimmed) || ORDERED.test(trimmed)) {
      flushParagraph();
      const ordered = ORDERED.test(trimmed);
      const items: MarkdownInline[][] = [];
      while (i < lines.length) {
        const item = lines[i].trim();
        const match = ordered ? ORDERED.exec(item) : UNORDERED.exec(item);
        if (!match) break;
        items.push(parseInline(match[1]));
        i += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    if (QUOTE.test(trimmed)) {
      flushParagraph();
      const quoted: string[] = [];
      while (i < lines.length) {
        const match = QUOTE.exec(lines[i].trim());
        if (!match) break;
        quoted.push(match[1]);
        i += 1;
      }
      blocks.push({ type: "quote", children: parseInline(quoted.join(" ").trim()) });
      continue;
    }
    paragraph.push(trimmed);
    i += 1;
  }
  flushParagraph();
  return blocks;
}

/** The plain text of a run, for a title or a test. */
export function inlineText(nodes: MarkdownInline[]): string {
  return nodes
    .map((n) => (n.type === "text" || n.type === "code" ? n.text : inlineText(n.children)))
    .join("");
}
