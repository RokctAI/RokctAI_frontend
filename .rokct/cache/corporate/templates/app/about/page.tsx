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


// /about - the company's about page (corporate_sdk 1.1.0; Ray,
// 2026-09-10: corporate_sdk owns /about and /team as renderers; their
// content comes from the shell's data/ folder or is empty). A server
// component: the prose is `data/about.md` through base_sdk 1.35.0's
// reader (markdown, parsed by components/custom/company/markdown-parser.ts
// and rendered as elements by markdown.tsx - never as HTML from a string), and under it the home
// SDK's cards for this page through base_sdk 1.38.0's
// `pageSectionsFor("about")` (Supacharge's founder card). With neither,
// one neutral line. Always 200.
//
// Since 1.2.0 the page sits in the shell's SITE FRAME (base_sdk 1.47.0's
// components/custom/site-frame.tsx: the home SDK's header with its menu,
// its theme and its footer) whenever the home SDK registered one - Ray,
// 2026-09-11 20:44Z: "we have no way to get here and its so disconnected
// to the rest of the site" - and in its own CompanyFrame otherwise, so a
// shell composed without a home landing still renders.

import React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/app/lib/site-metadata";
import { getPlatformSession } from "@/app/services/base/session";
import { COMPANY_EMPTY_STATE, COMPANY_PAGES } from "@/components/custom/company/company-pages";
import { CompanyFrame } from "@/components/custom/company/company-frame";
import { CompanySections } from "@/components/custom/company/company-sections";
import { Markdown } from "@/components/custom/company/markdown";
import { pageSectionsFor } from "@/components/custom/landing/landing-page";
import { resolveSiteFrame } from "@/components/custom/landing/site-frame";
import { loadLegalIndex } from "@/components/custom/legal/load-legal-doc";
import { SiteFrame } from "@/components/custom/site-frame";
import { hasSiteData, readSiteData, siteDataMode } from "@/lib/site-data/read-site-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ title: COMPANY_PAGES.about.label });
}

export default async function AboutPage() {
  const dataMode = siteDataMode();
  const about = hasSiteData("about") ? (readSiteData("about") ?? "").trim() : "";
  const session = await getPlatformSession();
  const [sections, terms, frame] = await Promise.all([
    pageSectionsFor("about", { plans: [], session, dataMode }),
    loadLegalIndex(),
    resolveSiteFrame({ plans: [], session, dataMode }),
  ]);
  const empty = about.length === 0 && sections.length === 0;
  const body = (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12" data-about-page="">
      {about.length > 0 && (
        <article className="mx-auto w-full max-w-3xl">
          <Markdown source={about} />
        </article>
      )}
      <CompanySections sections={sections} session={session} dataMode={dataMode} />
      {empty && (
        <p className="mx-auto w-full max-w-3xl opacity-70" data-empty-state="">
          {COMPANY_EMPTY_STATE.about}
        </p>
      )}
    </div>
  );
  if (!frame.registered) return <CompanyFrame page="about" terms={terms}>{body}</CompanyFrame>;
  return (
    <SiteFrame frame={frame} page="about" session={session} dataMode={dataMode}>
      {body}
    </SiteFrame>
  );
}
