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
// rokct.ai's header menu, for base_sdk's header-menu registry
// (components/custom/landing/header-menu.ts, base_sdk >= 1.20.0), which the
// shared header renders inside itself: inline beside the logo from the `lg`
// breakpoint up, behind a burger below it.
//
// Since 1.9.0 (base_sdk 1.18.0) the groups are ONE panel under the first
// group's label, as the old header drew them: Product is the lead group,
// so "Product" is the trigger and its three platform entries carry the
// `icon` and `description` the old panel's left-hand cards had (FiBox /
// FiGlobe / FiSmartphone and header.chrome_support / browser_support /
// mobile_support in the hand-written header); AI Chat, Productivity, Tools
// and Summary are the four headed columns beside them.
//
// Ray, 2026-09-09: rokct.ai and supacharge.app must use ONE header, the same
// component, with the menu inside it. base_sdk 1.14.0 ships that header;
// what it does not know is rokct.ai's WORDS, which until now lived only in
// rokctai_frontend's own components/custom/header.tsx and its
// app/config/features.ts (the PLATFORM_FEATURES registry that header drew
// its mega menu from). This module is those words as a HeaderMenu, entry
// for entry, so the shared header shows on rokct.ai what the hand-written
// one did: the top-level links, the Product dropdown's five columns, and
// the two call-to-action buttons.
//
// `pricing` is an ANCHOR, not a link. copied-pricing.tsx registers
// `{ id: "pricing", label: "Pricing" }` in its meta.nav, so base resolves
// the id against the page's live nav, lifts the label from that entry, and
// drops it on a render where the section is not on the page - which a
// hand-written "#pricing" href could not do. Affiliate and Teams are routes
// the page has no section for, so they are fixed links.
//
// Labels come from the shell's own dictionary through `t` (agent_sdk
// requires app/lib/i18n/index.ts; rokctai_frontend's en.json carries every
// features.* and header.* key used here), read once at module load - `t`
// is a synchronous lookup over a static JSON, and the header-menu contract
// wants already-translated strings. `word` keeps the English beside each
// key so a shell whose dictionary lacks a key shows the word, not the key
// (`t` answers the key itself when it finds nothing).
//
// Badges use the declared "new" | "soon" vocabulary and base renders a
// "soon" entry non-navigable, so the "#" hrefs on unreleased features are
// never followed. The two Chrome Web Store entries are `external` and open
// in a new tab.

import type { HeaderMenu } from "@/components/custom/landing/header-menu";
import t from "@/app/lib/i18n";

const CHROME_WEB_STORE = "https://chromewebstore.google.com/";

/** `t(key)`, or `fallback` when the dictionary has no such key. */
function word(key: string, fallback: string): string {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

const AGENT_HEADER_MENU: HeaderMenu = {
  anchors: ["pricing"],
  links: [
    { id: "affiliate", label: word("features.affiliate", "Affiliate"), href: "/affiliate" },
    { id: "teams", label: word("features.teams", "Teams"), href: "/teams" },
  ],
  groups: [
    {
      id: "product",
      label: word("header.product", "Product"),
      items: [
        {
          id: "browser-extension",
          label: word("features.browser_extension", "Browser Extension"),
          href: CHROME_WEB_STORE,
          external: true,
          icon: "box",
          description: word("header.chrome_support", "Supports Chrome"),
        },
        {
          id: "web-app",
          label: word("features.web_app", "Web App"),
          href: "/dashboard",
          icon: "globe",
          description: word("header.browser_support", "Open in browser"),
        },
        {
          id: "mobile-apps",
          label: word("features.mobile_apps", "Mobile Apps"),
          href: "#",
          badge: "soon",
          icon: "smartphone",
          description: word("header.mobile_support", "iOS and Android"),
        },
      ],
    },
    {
      id: "ai-chat",
      label: word("header.ai_chat", "AI Chat"),
      items: [
        { id: "chat-rokct", label: word("features.chat_rokct", "Chat with ROK"), href: "/chat" },
      ],
    },
    {
      id: "productivity",
      label: word("header.productivity", "Productivity"),
      items: [
        { id: "ai-erp", label: word("features.ai_erp", "AI ERP"), href: "#", badge: "soon" },
        {
          id: "tender-assist",
          label: word("features.tender_assist", "Tender Assist"),
          href: "#",
          badge: "new",
        },
        { id: "telephony", label: word("features.telephony", "Telephony"), href: "#" },
      ],
    },
    {
      id: "tools",
      label: word("header.tools", "Tools"),
      items: [
        { id: "fraud-detector", label: word("features.fraud_detector", "Fraud Detector"), href: "#" },
        { id: "loan-management", label: word("features.loan_man", "Loan Management"), href: "#" },
        { id: "tenders", label: word("features.tenders", "Tenders"), href: "#", badge: "new" },
        { id: "funding", label: word("features.funding", "Funding"), href: "#", badge: "new" },
      ],
    },
    {
      id: "summary",
      label: word("header.summary", "Summary"),
      items: [
        {
          id: "yt-summarizer",
          label: word("features.yt_summarizer", "YouTube Summarizer"),
          href: "#",
        },
        {
          id: "article-summarizer",
          label: word("features.article_summarizer", "Article Summarizer"),
          href: "#",
        },
      ],
    },
  ],
  actions: [
    {
      id: "chat-rokct",
      label: word("features.chat_rokct", "Chat with ROK"),
      href: "/chat",
      variant: "ghost",
    },
    {
      id: "add-extension",
      label: word("header.add_extension", "Add ROK Extension"),
      href: CHROME_WEB_STORE,
      variant: "primary",
      external: true,
      // The Chrome mark the hand-written header drew on this button (since
      // 1.12.0; HeaderMenuAction.icon and the "chrome" glyph are base_sdk
      // 1.20.0's, lucide's own mark rather than a hot-linked image).
      icon: "chrome",
    },
  ],
};

export default AGENT_HEADER_MENU;
