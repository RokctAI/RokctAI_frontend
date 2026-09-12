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


// The markdown renderer (corporate_sdk 1.1.0): markdown-parser.ts's blocks as
// React elements - headings, paragraphs, lists, quotes, code, rules and
// the inline runs - so a `data/about.md` reaches the page as elements the
// server rendered, never as HTML set from a string. Server-safe: no
// directive, no hooks. Neutral classes only; the shell's own prose
// tokens colour it.

import React from "react";
import Link from "next/link";

import {
  parseMarkdown,
  type MarkdownBlock,
  type MarkdownInline,
} from "@/components/custom/company/markdown-parser";

function Inline({ nodes }: { nodes: MarkdownInline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.type) {
          case "text":
            return <React.Fragment key={index}>{node.text}</React.Fragment>;
          case "code":
            return (
              <code key={index} className="rounded bg-black/5 px-1 py-0.5 text-[0.9em] dark:bg-white/10">
                {node.text}
              </code>
            );
          case "strong":
            return (
              <strong key={index}>
                <Inline nodes={node.children} />
              </strong>
            );
          case "em":
            return (
              <em key={index}>
                <Inline nodes={node.children} />
              </em>
            );
          case "link":
            return node.href.startsWith("/") || node.href.startsWith("#") ? (
              <Link key={index} href={node.href} className="underline underline-offset-4">
                <Inline nodes={node.children} />
              </Link>
            ) : (
              <a
                key={index}
                href={node.href}
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                <Inline nodes={node.children} />
              </a>
            );
        }
      })}
    </>
  );
}

const HEADING_CLASS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "text-3xl font-bold tracking-tight",
  2: "text-2xl font-bold tracking-tight",
  3: "text-xl font-semibold",
  4: "text-lg font-semibold",
  5: "text-base font-semibold",
  6: "text-sm font-semibold uppercase tracking-wide",
};

function Block({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag className={HEADING_CLASS[block.level]}>
          <Inline nodes={block.children} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="leading-relaxed">
          <Inline nodes={block.children} />
        </p>
      );
    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index}>
          <Inline nodes={item} />
        </li>
      ));
      return block.ordered ? (
        <ol className="list-decimal space-y-1 pl-6">{items}</ol>
      ) : (
        <ul className="list-disc space-y-1 pl-6">{items}</ul>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-2 border-black/20 pl-4 italic opacity-80 dark:border-white/20">
          <Inline nodes={block.children} />
        </blockquote>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg bg-black/5 p-4 text-sm dark:bg-white/10">
          <code>{block.text}</code>
        </pre>
      );
    case "rule":
      return <hr className="border-black/10 dark:border-white/10" />;
  }
}

export interface MarkdownProps {
  source: string;
  className?: string;
}

/** The markdown, rendered: one element per block, in order. */
export function Markdown({ source, className = "" }: MarkdownProps) {
  const blocks = parseMarkdown(source);
  return (
    <div className={`flex flex-col gap-4 ${className}`} data-markdown="">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

export default Markdown;
