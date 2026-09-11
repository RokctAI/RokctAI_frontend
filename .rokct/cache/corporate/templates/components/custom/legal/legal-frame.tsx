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

// The frame every legal page sits in (corporate_sdk 1.0.0): a top bar with
// the shell's name linking home and the index link, the page's content,
// and base_sdk's footer chrome row at the bottom carrying the Legal link
// group built from the same documents - so the row a home SDK's footer
// draws once it opts in is the row these pages already draw.
//
// Server-safe, directive-free: FooterChromeRow is base's client component
// and takes plain config; the name comes from the host's app/config/
// platform.ts (host-owned; never written here).

import React from "react";
import Link from "next/link";

import { PLATFORM_NAME } from "@/app/config/platform";
import { FooterChromeRow } from "@/components/custom/footer-chrome";
import { FOOTER_CHROME_CONFIG } from "@/components/custom/landing/footer-chrome-config";
import {
  DEFAULT_LEGAL_GROUP_LABEL,
  LEGAL_ROUTE,
  legalFooterLinks,
  type PublicTerm,
} from "@/components/custom/landing/legal-links";

export interface LegalFrameProps {
  /** The published documents, for the footer's Legal row. */
  terms: readonly PublicTerm[];
  /** Whether the top bar links to the index (off on the index itself). */
  indexLink?: boolean;
  children: React.ReactNode;
}

export function LegalFrame({ terms, indexLink = true, children }: LegalFrameProps) {
  const config = {
    ...FOOTER_CHROME_CONFIG,
    links: [...(FOOTER_CHROME_CONFIG.links ?? []), ...legalFooterLinks(terms)],
  };
  return (
    <div className="flex min-h-screen flex-col" data-legal-frame="">
      <header className="border-b border-black/10 dark:border-white/10">
        <nav
          aria-label="Legal pages"
          className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 text-sm"
        >
          <Link href="/" className="font-bold tracking-tight">
            {PLATFORM_NAME}
          </Link>
          {indexLink && (
            <Link
              href={LEGAL_ROUTE}
              className="opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
            >
              {DEFAULT_LEGAL_GROUP_LABEL}
            </Link>
          )}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-black/10 dark:border-white/10">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <FooterChromeRow config={config} />
        </div>
      </footer>
    </div>
  );
}

export default LegalFrame;
