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
// browser lives in the sibling ./social-section.client.tsx and is rendered
// from here.

import React from "react";

import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";
import { SocialSection } from "@/components/custom/social-section.client";

export { SocialSection } from "@/components/custom/social-section.client";

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the
 * page order and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 30,
  nav: [{ id: "social", label: "Social Media" }],
};

export default function SocialSectionEntry({ id }: PageSectionProps) {
  return <SocialSection id={id} />;
}
