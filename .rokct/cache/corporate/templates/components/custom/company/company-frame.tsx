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


// The frame the company pages sit in (corporate_sdk 1.1.0): the same
// shape as the legal frame - a top bar with the shell's name linking home
// and the company pages' links, the content, and base_sdk's footer chrome
// row carrying the Legal link group built from the shell's documents - so
// /about, /team and /legal read as one set of pages. Server-safe,
// directive-free: FooterChromeRow is base's client component and takes
// plain config; the name comes from the host's app/config/platform.ts
// (host-owned; never written here).

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
import { COMPANY_PAGES, type CompanyPage } from "@/components/custom/company/company-pages";

export interface CompanyFrameProps {
  /** The page being framed: its own link is drawn as the current one. */
  page: CompanyPage;
  /** The published legal documents, for the footer's Legal row. */
  terms: readonly PublicTerm[];
  children: React.ReactNode;
}

export function CompanyFrame({ page, terms, children }: CompanyFrameProps) {
  const config = {
    ...FOOTER_CHROME_CONFIG,
    links: [...(FOOTER_CHROME_CONFIG.links ?? []), ...legalFooterLinks(terms)],
  };
  const pages = Object.entries(COMPANY_PAGES) as [CompanyPage, (typeof COMPANY_PAGES)[CompanyPage]][];
  return (
    <div className="flex min-h-screen flex-col" data-company-frame={page}>
      <header className="border-b border-black/10 dark:border-white/10">
        <nav
          aria-label="Company pages"
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 text-sm"
        >
          <Link href="/" className="font-bold tracking-tight">
            {PLATFORM_NAME}
          </Link>
          <div className="flex items-center gap-5">
            {pages.map(([key, info]) => (
              <Link
                key={key}
                href={info.route}
                aria-current={key === page ? "page" : undefined}
                className={
                  key === page
                    ? "font-semibold"
                    : "opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
                }
              >
                {info.label}
              </Link>
            ))}
            {terms.length > 0 && (
              <Link
                href={LEGAL_ROUTE}
                className="opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
              >
                {DEFAULT_LEGAL_GROUP_LABEL}
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-black/10 dark:border-white/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <FooterChromeRow config={config} />
        </div>
      </footer>
    </div>
  );
}

export default CompanyFrame;
