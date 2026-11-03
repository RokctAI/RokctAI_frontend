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
//
// Since 1.14.0 (base_sdk 1.24.0) the menu also declares the BRAND the old
// header drew (Ray, 2026-09-09: "header lost functions the old rokct header
// had"; rokct.ai keeps everything its old host header had): the mark with
// its BETA strip (`badge`, the old `<BrandLogo showBadge={true} />`), and
// the COLLAPSING brand - the large wordmark that slid away 1.5s after load
// leaving the mark, the visitor's country code and a chevron, with the nav
// fading until the pointer was over the bar or the page scrolled. The code
// comes from the same place the old header read it: `getBrandingSync()`,
// the shell's client-side branding cache (app/config/platform.ts, an
// agent_sdk `requires` file), whose `code` and `style` the old header
// spread onto its span. "Chat with ROK" is `secondary`, the filled muted
// button the old nav drew it as, not the outlined `ghost`.
//
// Since 1.15.0 (base_sdk 1.25.0) the extension button draws the Chrome
// Web Store MARK the old header drew, from a public file of the shell's
// rather than the third party's CDN the old header hot-linked it from.
// Ray, 2026-09-09: "i dont think merlin owns [the icon] so use it but
// bring it local". Since 1.16.0 (base_sdk 1.26.0) that file is base's:
// base installs public/brand/marks/chrome-web-store.svg on every host and
// this SDK only names the path, which is how a home SDK opts in. The
// hero's Chrome Web Store badge (./agent-hero-copy.ts) names the same path.

import type { HeaderMenu } from "@/components/custom/landing/header-menu";
import { getBrandingSync } from "@/app/config/platform";
import t from "@/app/lib/i18n";

const CHROME_WEB_STORE = "https://chromewebstore.google.com/";

/**
 * The Chrome Web Store mark on the extension button (1.15.0): the SVG
 * base_sdk 1.26.0 installs under public/brand/marks/ (this SDK's own file
 * until 1.16.0), the drawing the old header hot-linked, served by the
 * shell itself. ./agent-hero-copy.ts names the same file for the hero's
 * badge; keep the two literals identical.
 */
const CHROME_WEB_STORE_MARK = {
  src: "/brand/marks/chrome-web-store.svg",
  alt: "Chrome Web Store",
};

/** `t(key)`, or `fallback` when the dictionary has no such key. */
function word(key: string, fallback: string): string {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

/**
 * The country code beside the collapsed mark, as the old header found it:
 * the branding cache the shell keeps on the client, read once after
 * mount. An empty cache (a first visit) answers nothing and
 * the mark collapses alone, exactly as before; the cache carries the
 * inline style (scale, baseline offset) the shell wants on the code.
 */
function brandingCode(): { text: string; style?: Record<string, string | number> } | null {
  const branding = getBrandingSync() as
    | { code?: string | null; style?: Record<string, string | number> }
    | null
    | undefined;
  const text = branding?.code?.trim();
  if (!text) return null;
  return { text, style: branding?.style };
}

const AGENT_HEADER_MENU: HeaderMenu = {
  brand: {
    // The host's own mark (rokctai_frontend's brand-logo.tsx) with its
    // BETA strip, and the old header's brand motion, defaults as it had
    // them (1500ms).
    badge: true,
    collapse: { delayMs: 1500, code: brandingCode },
  },
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
      // The filled muted button the old nav drew it as (1.14.0; the
      // variant is base_sdk 1.24.0's).
      variant: "secondary",
    },
    {
      id: "add-extension",
      label: word("header.add_extension", "Add ROK Extension"),
      href: CHROME_WEB_STORE,
      variant: "primary",
      external: true,
      // The Chrome Web Store mark the hand-written header drew on this
      // button, as a local file (1.15.0; an image icon on an action is
      // base_sdk 1.25.0's). 1.12.0 to 1.14.0 drew lucide's "chrome" glyph
      // here because the old header's file was a third-party hot-link.
      icon: CHROME_WEB_STORE_MARK,
    },
  ],
};

export default AGENT_HEADER_MENU;
