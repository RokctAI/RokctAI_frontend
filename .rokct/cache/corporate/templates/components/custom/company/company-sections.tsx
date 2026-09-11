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


// The home SDK's cards on a company page (corporate_sdk 1.1.0): the
// sections base_sdk 1.38.0's `pageSectionsFor(page)` answered, rendered
// with the PageSectionProps a landing section gets - the page's DOM id,
// the sign-in / sign-up routes from base's LANDING_CONFIG, the session,
// no plans (a company page prefetches none), no floating nav and the
// shell's data mode - so a section written for the landing draws the
// same here. Server-safe: the section entries are server-readable by
// base's contract, and their client halves hydrate themselves.

import React from "react";

import type { LoadedSection } from "@/components/custom/landing/landing-page";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import type { SiteDataMode } from "@/lib/site-data/kinds";

export interface CompanySectionsProps {
  sections: LoadedSection[];
  session?: unknown;
  dataMode: SiteDataMode;
}

export function CompanySections({ sections, session, dataMode }: CompanySectionsProps) {
  if (sections.length === 0) return null;
  return (
    <div className="flex flex-col gap-12" data-company-sections={sections.length}>
      {sections.map(({ id, domId, Component }) => (
        <Component
          key={id}
          id={domId}
          signupUrl={LANDING_CONFIG.signupUrl}
          loginUrl={LANDING_CONFIG.loginUrl}
          session={session}
          plans={[]}
          nav={[]}
          dataMode={dataMode}
        />
      ))}
    </div>
  );
}

export default CompanySections;
