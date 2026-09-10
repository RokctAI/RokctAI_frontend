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
// browser lives in the sibling ./floating-nav.client.tsx and is rendered
// from here.

import React from "react";

import { FloatingNav } from "@/components/custom/floating-nav.client";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export { FloatingNav } from "@/components/custom/floating-nav.client";

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: a negative order, so the
 * page renders it before the hero as a fixed overlay that stays visible
 * while the hero shows search results, as the shell did. Not a nav stop.
 */
export const meta: PageSectionMeta = { order: -1, nav: [] };

/** The registered form: the page hands the whole nav in as `nav`. */
export default function FloatingNavSection({ nav }: PageSectionProps) {
  return <FloatingNav items={nav} />;
}
