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

// agent_sdk 1.20.0: the chat's message shapes on AI SDK 6.
//
// The shell installs ai 6 and @ai-sdk/react 3, whose messages are UIMessage
// objects made of `parts`; the chat was written against AI SDK 4's
// `content` / `toolInvocations` / `experimental_attachments`. The chat
// history table keeps the stored (4-style) shape, which the host's history
// list and title reader still read, and this module is the one place the
// two shapes meet: stored rows become UIMessages for useChat, UIMessages are
// read back as text, files and tool results for the route and the message
// view. Pure: no React, no runtime import from "ai".

import type { UIMessage } from "ai";

/** A file attached to a chat message (4's Attachment, kept as a local type). */
export interface ChatAttachment {
  name?: string;
  url: string;
  contentType?: string;
}

/** A finished (or pending) tool call as the message view renders it. */
export interface ChatToolInvocation {
  state: "call" | "result";
  toolCallId: string;
  toolName: string;
  args: unknown;
  result?: any;
}

/** A chat row message as the history table stores it. */
export interface StoredChatMessage {
  id?: string;
  role: "user" | "assistant" | "system" | "tool";
  content?: unknown;
  toolInvocations?: Array<Partial<ChatToolInvocation>>;
  experimental_attachments?: ChatAttachment[];
  attachments?: ChatAttachment[];
  parts?: UIMessage["parts"];
}

/** Sends one user turn, the shape tool cards (disambiguate, reminders,
 * flights) call; the chat wires it to useChat's sendMessage. */
export type AppendMessage = (message: {
  role: "user";
  content: string;
}) => Promise<string | null | undefined>;

let localCounter = 0;
function localId(prefix: string): string {
  localCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${localCounter}`;
}

function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: any) => (c && c.type === "text" && typeof c.text === "string" ? c.text : ""))
      .join("");
  }
  return "";
}

/** A stored row (4-style, or already 6-style with `parts`) as a UIMessage. */
export function storedToUIMessage(message: StoredChatMessage): UIMessage | null {
  if (!message || (message.role !== "user" && message.role !== "assistant" && message.role !== "system")) {
    return null;
  }
  const id = message.id || localId("stored");
  if (Array.isArray(message.parts)) {
    return { id, role: message.role, parts: message.parts };
  }
  const parts: UIMessage["parts"] = [];
  const files = message.experimental_attachments || message.attachments || [];
  for (const f of files) {
    if (f && f.url) {
      parts.push({ type: "file", url: f.url, mediaType: f.contentType || "application/octet-stream", filename: f.name });
    }
  }
  for (const tool of message.toolInvocations || []) {
    if (!tool || !tool.toolName) continue;
    const toolCallId = tool.toolCallId || localId("tool");
    if (tool.state === "result") {
      parts.push({ type: "dynamic-tool", toolName: tool.toolName, toolCallId, state: "output-available", input: tool.args ?? {}, output: tool.result });
    } else {
      parts.push({ type: "dynamic-tool", toolName: tool.toolName, toolCallId, state: "input-available", input: tool.args ?? {} });
    }
  }
  const text = contentText(message.content);
  if (text) parts.push({ type: "text", text });
  return { id, role: message.role, parts };
}

/** Stored rows as UIMessages; tool-role rows and unreadable rows are skipped. */
export function storedToUIMessages(messages: unknown): UIMessage[] {
  let list: unknown = messages;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];
  return list
    .map((m) => storedToUIMessage(m as StoredChatMessage))
    .filter((m): m is UIMessage => m !== null);
}

/** The text of a message: 6's text parts, or 4's `content`. */
export function messageText(message: unknown): string {
  const m = message as { parts?: unknown; content?: unknown } | null;
  if (!m) return "";
  if (Array.isArray(m.parts)) {
    return m.parts
      .map((p: any) => (p && p.type === "text" && typeof p.text === "string" ? p.text : ""))
      .join("");
  }
  return contentText(m.content);
}

/** The files of a message: 6's file parts, or 4's attachments. */
export function messageFiles(message: unknown): ChatAttachment[] {
  const m = message as StoredChatMessage | null;
  if (!m) return [];
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p: any) => p && p.type === "file" && typeof p.url === "string")
      .map((p: any) => ({ url: p.url, name: p.filename, contentType: p.mediaType }));
  }
  return (m.experimental_attachments || m.attachments || []).filter((f) => f && f.url);
}

/** The tool calls of a UIMessage in the view's (4-style) shape. */
export function messageToolInvocations(message: UIMessage): ChatToolInvocation[] {
  const out: ChatToolInvocation[] = [];
  for (const part of message.parts) {
    const p = part as any;
    let toolName: string | undefined;
    if (p.type === "dynamic-tool") toolName = p.toolName;
    else if (typeof p.type === "string" && p.type.startsWith("tool-")) toolName = p.type.slice(5);
    if (!toolName) continue;
    out.push(
      p.state === "output-available"
        ? { state: "result", toolCallId: p.toolCallId, toolName, args: p.input, result: p.output }
        : { state: "call", toolCallId: p.toolCallId, toolName, args: p.input },
    );
  }
  return out;
}

/** A UIMessage in the stored (4-style) shape the history table keeps. */
export function toStoredMessage(message: {
  id?: string;
  role: StoredChatMessage["role"];
  text: string;
  files?: ChatAttachment[];
  toolInvocations?: ChatToolInvocation[];
}): StoredChatMessage {
  const stored: StoredChatMessage = { role: message.role, content: message.text };
  if (message.id) stored.id = message.id;
  if (message.files && message.files.length > 0) stored.experimental_attachments = message.files;
  if (message.toolInvocations && message.toolInvocations.length > 0) stored.toolInvocations = message.toolInvocations;
  return stored;
}

/** A user turn and the local card that answers it, for intents the chat
 * handles in the browser (draft task, project, note, lead, profile). */
export function localExchange(
  text: string,
  toolName: string,
  args: unknown,
  result: unknown,
): [UIMessage, UIMessage] {
  return [
    { id: localId("local-user"), role: "user", parts: [{ type: "text", text }] },
    {
      id: localId("local-assistant"),
      role: "assistant",
      parts: [{ type: "dynamic-tool", toolName, toolCallId: localId("local"), state: "output-available", input: args ?? {}, output: result }],
    },
  ];
}

/** The text sent to ROK for a turn: the typed text, or, for a turn that
 * carries only files, a line naming each file, so it is never empty. */
export function turnText(text: string, files: ChatAttachment[]): string {
  const typed = (text || "").trim();
  if (typed) return typed;
  if (!files.length) return "";
  return ["Attached files:", ...files.map((f) => `- ${f.name || f.url}`)].join("\n");
}
