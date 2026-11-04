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

// corporate_sdk 1.7.0: the sized bottles' SVG markup (./site-sizes-art.ts)
// as React elements. The markup is this SDK's own, with every data string
// escaped where it is written; this reads it back into elements so nothing
// on the page is set from an HTML string. A small XML reader: elements,
// double-quoted attributes and text; attribute names in kebab case become
// React's camel case (aria-* and data-* stay), `class` is className and
// `style` becomes an object (custom properties kept as written). Server
// safe.
import React from "react";

const TOKEN = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g;
const ATTR = /([\w:-]+)="([^"]*)"/g;

function decode(s: string): string {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

function camel(name: string): string {
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function styleOf(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of css.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k.startsWith("--") ? k : camel(k)] = part.slice(i + 1).trim();
  }
  return out;
}

function propsOf(attrs: string, key: number): Record<string, unknown> {
  const props: Record<string, unknown> = { key };
  for (const m of attrs.matchAll(ATTR)) {
    const [, name, raw] = m;
    const value = decode(raw);
    if (name === "class") props.className = value;
    else if (name === "style") props.style = styleOf(value);
    else if (name.startsWith("aria-") || name.startsWith("data-")) props[name] = value;
    else props[camel(name)] = value;
  }
  return props;
}

interface Node {
  tag: string;
  props: Record<string, unknown>;
  children: React.ReactNode[];
}

/** The elements of `markup` (one or more top-level nodes). `rootProps` are merged into the first element. */
export function svgElements(markup: string, rootProps?: Record<string, unknown>): React.ReactNode {
  const root: Node = { tag: "", props: {}, children: [] };
  const stack: Node[] = [root];
  let key = 0;
  let first = true;
  for (const m of markup.matchAll(TOKEN)) {
    const [, close, tag, attrs, selfClose, text] = m;
    const top = stack[stack.length - 1];
    if (text !== undefined) {
      if (text.trim()) top.children.push(decode(text));
      continue;
    }
    if (close) {
      const node = stack.pop()!;
      stack[stack.length - 1].children.push(React.createElement(node.tag, node.props, ...node.children));
      continue;
    }
    const props = propsOf(attrs ?? "", key++);
    if (first && rootProps) Object.assign(props, rootProps);
    first = false;
    if (selfClose) top.children.push(React.createElement(tag, props));
    else stack.push({ tag, props, children: [] });
  }
  return root.children.length === 1 ? root.children[0] : root.children;
}
