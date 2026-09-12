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

// The site frame, drawn (base_sdk 1.47.0): the home SDK's header, theme
// and footer around a composed page that is not the landing, so
// corporate_sdk's /about, /team and /legal sit in the same shell as
// /landing (Ray, 2026-09-11 20:44Z: "we have no way to get here and its
// so disconnected to the rest of the site"). A server component,
// directive-free: the frame's shape comes from
// components/custom/landing/site-frame.ts (resolved by the caller, so it
// can keep its own frame when `registered` is false, or here when none is
// handed in); the header is base's own components/custom/header.tsx with
// the menu resolved on the server, so its links are in the first HTML;
// the frame sections render with the PageSectionProps a landing section
// gets (no plans, no nav - the page carries neither); and the floating
// "Back to top" button is mounted once, as the landing shell mounts it.

import React from "react";

import { BackToTop } from "@/components/custom/back-to-top";
import { Header } from "@/components/custom/header";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import type { LoadedSection } from "@/components/custom/landing/landing-page";
import {
  SITE_FRAME_ROOT_CLASS,
  resolveSiteFrame,
  type SiteFrameLayout,
} from "@/components/custom/landing/site-frame";
import type { SiteDataMode } from "@/lib/site-data/kinds";

export interface SiteFrameProps {
  /**
   * The frame as the page resolved it (`resolveSiteFrame`), so the page
   * could look at `registered` first; resolved here, with `session` and
   * `dataMode`, when absent.
   */
  frame?: SiteFrameLayout;
  /** The visitor's session as the page read it through the kernel seam, or null. */
  session?: unknown;
  /** The shell's data mode, as the page read it through `siteDataMode()`. */
  dataMode?: SiteDataMode;
  /** A word naming the page, carried as `data-site-frame` on the root; "" when absent. */
  page?: string;
  children: React.ReactNode;
}

function FrameSections({
  sections,
  session,
  dataMode,
}: {
  sections: LoadedSection[];
  session?: unknown;
  dataMode?: SiteDataMode;
}) {
  if (sections.length === 0) return null;
  return (
    <>
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
    </>
  );
}

export async function SiteFrame({ frame, session, dataMode, page, children }: SiteFrameProps) {
  const layout = frame ?? (await resolveSiteFrame({ plans: [], session, dataMode }));
  const rootClassName = [SITE_FRAME_ROOT_CLASS, layout.rootClass.trim()]
    .filter((c) => c.length > 0)
    .join(" ");
  return (
    <div className={rootClassName} data-site-frame={page ?? ""}>
      <Header
        loginUrl={LANDING_CONFIG.loginUrl}
        signupUrl={LANDING_CONFIG.signupUrl}
        session={session}
        menuItems={layout.menu.items}
        groups={layout.menu.groups}
        megaLabel={layout.menu.megaLabel}
        actions={layout.menu.actions}
        dataMode={dataMode}
      />
      <FrameSections sections={layout.before} session={session} dataMode={dataMode} />
      <main className="flex-1">{children}</main>
      <FrameSections sections={layout.after} session={session} dataMode={dataMode} />
      <BackToTop />
    </div>
  );
}

export default SiteFrame;
