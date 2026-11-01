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


// A local-data site's footer (order 95, frame): the logo (data/site.json
// `footer.logo`, 1.5.0) or the wordmark (`wordmark`, else the name), the
// motto and the place line, the links
// (`footer.links`, else one per section with a nav label) and base's chrome
// row with the shell's published legal links. The row ends with base_sdk
// 1.54.0's site credit, `© <year> <site name> · Built with ♥ by ROKCT`
// (Ray, 2026-10-31: "all site will be copyright sitename then built with
// love (as heart) by ROKCT"): the name is data/site.json `name`, never the
// legal entity, so `footer.legal` is not drawn (1.4.1).
import React from "react";
import Link from "next/link";

import { listPublicTerms } from "@/app/actions/base/legal";
import { FooterChromeRow } from "@/components/custom/footer-chrome";
import type { FooterChromeConfig } from "@/components/custom/landing/footer-chrome-config";
import { legalFooterLinks } from "@/components/custom/landing/legal-links";
import type { PageSectionMeta, PageSectionProps } from "@/components/custom/landing/page-sections";

import { Wordmark } from "./site-art";
import { isDataSite, siteKind, siteNav } from "./site-source";

/** The version the chrome row prints when the deployment sets none. */
export const SITE_FOOTER_VERSION = "1.0.0";

const FOOTER_CHROME: FooterChromeConfig = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || SITE_FOOTER_VERSION,
  statusColors: {
    operational: "var(--cs-ok)",
    maintenance: "var(--cs-highlight)",
    offline: "var(--cs-brand)",
    checking: "var(--cs-sec)",
  },
};

export async function SiteFooter({ id }: { id?: string }) {
  const terms = await listPublicTerms();
  const site = siteKind("site");
  const links = site?.footer?.links ?? siteNav().map((n) => ({ label: n.label, href: `#${n.id}` }));
  return (
    <footer id={id} className="w-full border-t border-[var(--cs-sub)] py-14 text-[var(--cs-sec)] md:py-20">
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4 xl:px-0">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            {site?.footer?.logo ? (
              // 1.5.0: the site's own logo image, tinted the brand text colour in either theme.
              <span
                role="img"
                aria-label={site.name}
                className="cs-footer-logo"
                style={{ ["--cs-footer-logo" as string]: `url("${site.footer.logo}")` }}
              />
            ) : (
              site && (
                <Wordmark
                  wordmark={site.wordmark ?? { lead: site.name }}
                  name={site.name}
                  className="text-[2.1rem] text-[var(--cs-brand-text)]"
                />
              )
            )}
            {site?.motto && <p className="mt-2 text-base font-semibold text-[var(--cs-ink)]">{site.motto}</p>}
            {site?.footer?.line && <p className="cs-k">{site.footer.line}</p>}
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-semibold sm:flex sm:flex-wrap">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--cs-ink)]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <FooterChromeRow config={{ ...FOOTER_CHROME, siteName: site?.name, links: legalFooterLinks(terms) }} className="border-t border-[var(--cs-sub)] pt-6" />
      </div>
    </footer>
  );
}

export const meta: PageSectionMeta = { order: 95, nav: [], anchor: "site-footer", frame: true, renders: () => isDataSite() };
export default function SiteFooterSection({ id }: PageSectionProps) {
  return <SiteFooter id={id} />;
}
