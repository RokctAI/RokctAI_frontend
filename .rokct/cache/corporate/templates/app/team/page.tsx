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


// /team - the company's team page (corporate_sdk 1.1.0). A server
// component: the members are `data/team.json` through base_sdk 1.35.0's
// reader (name, role, optional photo, optional links), drawn as a card
// grid by components/custom/company/team-grid.tsx, and under them the
// home SDK's cards for this page through base_sdk 1.38.0's
// `pageSectionsFor("team")`. With neither, one neutral line. Always 200.
// Since 1.2.0 the page sits in the shell's site frame (base_sdk 1.47.0's
// SiteFrame - the home SDK's header, theme and footer) whenever the home
// SDK registered one, and in its own CompanyFrame otherwise (Ray,
// 2026-09-11 20:44Z: "we have no way to get here and its so disconnected
// to the rest of the site").

import React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/app/lib/site-metadata";
import { getPlatformSession } from "@/app/services/base/session";
import { COMPANY_EMPTY_STATE, COMPANY_PAGES } from "@/components/custom/company/company-pages";
import { CompanyFrame } from "@/components/custom/company/company-frame";
import { CompanySections } from "@/components/custom/company/company-sections";
import { TeamGrid } from "@/components/custom/company/team-grid";
import { pageSectionsFor } from "@/components/custom/landing/landing-page";
import { resolveSiteFrame } from "@/components/custom/landing/site-frame";
import { loadLegalIndex } from "@/components/custom/legal/load-legal-doc";
import { SiteFrame } from "@/components/custom/site-frame";
import { hasSiteData, readSiteData, siteDataMode } from "@/lib/site-data/read-site-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ title: COMPANY_PAGES.team.label });
}

export default async function TeamPage() {
  const dataMode = siteDataMode();
  const members = hasSiteData("team") ? (readSiteData("team")?.members ?? []) : [];
  const session = await getPlatformSession();
  const [sections, terms, frame] = await Promise.all([
    pageSectionsFor("team", { plans: [], session, dataMode }),
    loadLegalIndex(),
    resolveSiteFrame({ plans: [], session, dataMode }),
  ]);
  const empty = members.length === 0 && sections.length === 0;
  const body = (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12" data-team-page="">
      <h1 className="text-3xl font-bold tracking-tight">{COMPANY_PAGES.team.label}</h1>
      <TeamGrid members={members} />
      <CompanySections sections={sections} session={session} dataMode={dataMode} />
      {empty && (
        <p className="opacity-70" data-empty-state="">
          {COMPANY_EMPTY_STATE.team}
        </p>
      )}
    </div>
  );
  if (!frame.registered) return <CompanyFrame page="team" terms={terms}>{body}</CompanyFrame>;
  return (
    <SiteFrame frame={frame} page="team" session={session} dataMode={dataMode}>
      {body}
    </SiteFrame>
  );
}
