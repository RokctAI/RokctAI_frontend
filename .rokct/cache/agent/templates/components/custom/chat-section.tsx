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

// The section's ENTRY (since 1.18.0): what agent_sdk's manifest registers
// in base_sdk's components/custom/landing/page-sections.ts, and what
// base_sdk >= 1.32.0's server-rendered landing (app/landing/page.tsx
// through components/custom/landing/landing-page.ts) imports to read
// `meta`. No "use client" here, on purpose: a module that starts with it
// hands the server only client-reference proxies, so `meta.order`,
// `meta.nav`, `meta.renders` and `meta.rootClass` all read undefined there
// - the id falls back to the module name, the floating nav says "Scroll to
// <module>", the header's anchors do not resolve. `meta` is plain data and
// this default export is a server component; everything that needs the
// browser lives in the sibling ./chat-section.client.tsx and is rendered
// from here.

import React from "react";

import { PLATFORM_NAME } from "@/app/config/platform";
import { ChatSection } from "@/components/custom/chat-section.client";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export { ChatSection } from "@/components/custom/chat-section.client";

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * (right after the hero and before the logos strip) and its floating-nav
 * entries. The first id is the section's own DOM id; the page renders empty
 * anchors for the rest right after it, as the shell's landing-content.tsx
 * used to.
 */
export const meta: PageSectionMeta = {
  order: 10,
  nav: [
    { id: "chat", label: `${PLATFORM_NAME} Chat` },
    { id: "projects", label: "Projects" },
    { id: "crafts", label: "Crafts" },
    { id: "research", label: "Research Machine" },
  ],
};

export default function ChatSectionEntry({ id }: PageSectionProps) {
  return <ChatSection id={id} />;
}
