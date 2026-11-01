/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Licensed under the GNU Affero General Public License, version 3.
 */

// base_sdk 1.57.0: a site's order form goes by email, not WhatsApp (Ray,
// 2026-10-31: orders@<the site's own domain>). Pure helpers; the sending
// itself is the host's mail transport, configured with env secrets.

import type { SiteIdentity } from "./kinds.ts";

/**
 * The address orders go to: site.json `email.orders` if set, else
 * orders@`email.domain`, else orders@ the host the visitor is on (a leading
 * "www." dropped). null when none can be derived.
 */
export function orderEmailAddress(site: Pick<SiteIdentity, "email">, host?: string): string | null {
  if (site.email?.orders) return site.email.orders;
  const domain = site.email?.domain ?? host?.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
  return domain ? `orders@${domain}` : null;
}

/** The subject and plain-text body of an order email, one "label: value" line per answer. */
export function orderEmailMessage(business: string, lines: string[]): { subject: string; text: string } {
  return { subject: `Order: ${business}`, text: lines.join("\n") };
}

/** A mailto: link carrying the message, for the form's no-server fallback. */
export function orderMailto(to: string, msg: { subject: string; text: string }): string {
  return `mailto:${to}?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.text)}`;
}

/** The channels an order form offers: every one the site has unless `email.orderVia` turns one off. */
export function orderChannels(site: Pick<SiteIdentity, "email" | "whatsapp">): ("email" | "whatsapp")[] {
  const via = site.email?.orderVia;
  if (via === "email") return ["email"];
  if (via === "whatsapp") return site.whatsapp ? ["whatsapp"] : [];
  return site.whatsapp ? ["email", "whatsapp"] : ["email"];
}
