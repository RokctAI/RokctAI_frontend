/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Centralized configuration registry for platform and Mega Menu features.
// Driving visibility (active), names, hrefs, and badges (label) dynamically via numeric IDs
// so that changing a name does not leave old lingering terms in code IDs.

export interface FeatureLink {
  name: string;
  href: string;
  active: boolean;
  label?: "new" | "soon" | "none";
}

export const PLATFORM_FEATURES: Record<number, FeatureLink> = {
  // Left Column Platforms
  1: {
    name: "features.browser_extension",
    href: "https://chromewebstore.google.com/",
    active: true,
    label: "none",
  },
  2: {
    name: "features.web_app",
    href: "/dashboard",
    active: true,
    label: "none",
  },
  3: { name: "features.mobile_apps", href: "#", active: true, label: "none" },

  // AI Chat
  4: {
    name: "features.chat_rokct",
    href: "/chat",
    active: true,
    label: "none",
  },

  // Productivity Column
  5: { name: "features.ai_erp", href: "#", active: true, label: "soon" },
  6: { name: "features.tender_assist", href: "#", active: true, label: "new" },
  7: { name: "features.telephony", href: "#", active: true, label: "none" },

  // Tools Column
  8: {
    name: "features.fraud_detector",
    href: "#",
    active: true,
    label: "none",
  },
  9: { name: "features.loan_man", href: "#", active: true, label: "none" },
  10: { name: "features.tenders", href: "#", active: true, label: "new" },
  11: { name: "features.funding", href: "#", active: true, label: "new" },

  // Summary Column
  12: {
    name: "features.yt_summarizer",
    href: "#",
    active: true,
    label: "none",
  },
  13: {
    name: "features.article_summarizer",
    href: "#",
    active: true,
    label: "none",
  },

  // Top-Level Nav Links
  14: {
    name: "features.pricing",
    href: "#pricing",
    active: true,
    label: "none",
  },
  15: {
    name: "features.affiliate",
    href: "/affiliate",
    active: true,
    label: "none",
  },
  16: { name: "features.teams", href: "/teams", active: true, label: "none" },
  17: {
    name: "features.chat_rokct",
    href: "/chat",
    active: true,
    label: "none",
  },
};

// Legacy boolean exports for backward compatibility if imported elsewhere
export const SHOW_EXTENSION = PLATFORM_FEATURES[1]?.active ?? true;
export const SHOW_WEB_APP = PLATFORM_FEATURES[2]?.active ?? true;
export const SHOW_MOBILE_APPS = PLATFORM_FEATURES[3]?.active ?? true;
