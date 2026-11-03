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

import Link from "next/link";
import { LEGAL_COMPANY_NAME } from "@/app/config/platform";
import { listPublicTerms } from "@/app/actions/base/legal";
import { JobsService } from "@/app/services/control/jobs";
import { RoadmapPublicService } from "@/app/services/public/roadmap";
import t from "@/app/lib/i18n";
import { NetworkStrip } from "@/components/custom/network-strip";
import { FooterChromeRow } from "@/components/custom/footer-chrome";
import type { FooterChromeConfig } from "@/components/custom/landing/footer-chrome-config";
import { legalFooterLinks } from "@/components/custom/landing/legal-links";
import versionData from "@/version.json";

// rokct.ai's footer, in the redesign Ray approved on 2026-11-01: the yellow
// R tile and the ROKCT wordmark with the platform's one line, then three
// columns - Platform (the landing's own sections), Help and Company - and
// base's footer chrome row under them. Every link goes somewhere that
// exists: the Platform links are the landing's anchors (from any page they
// lead back to /landing), Roadmap and Careers show only when there is a
// public roadmap or an open job, and the legal documents are the chrome
// row's Legal group. The extension-era columns (AI tools, summarisers,
// social icons and a Contact us button with nowhere to go) are gone.
//
// The copyright / platform-status / version row is base_sdk's footer chrome
// (components/custom/footer-chrome.tsx, composed). It probes the platform
// through the gateway AFTER hydration via the getPlatformStatus() server
// action. Its site credit reads `© <year> ROKCT · Built with ♥ by ROKCT`
// (`siteName`; the heart is labelled "love" for a screen reader by base's
// site-credit.tsx). The row's Legal link group is base's too
// (components/custom/landing/legal-links.ts): every enabled "Terms and
// Conditions" document the shell publishes, one link each to
// corporate_sdk's /legal/<name> page, added per request (`links`).
const FOOTER_CHROME: FooterChromeConfig = {
  siteName: "ROKCT",
  copyrightHolder: LEGAL_COMPANY_NAME,
  version: versionData.frontend,
  labels: {
    statusPrefix: t("system.status_prefix"),
    operational: t("system.online"),
    offline: t("system.offline"),
    version: t("system.version"),
  },
};

/** The R of rokct.ai's mark (public/images/logo.svg without the registered sign). */
const R_PATH =
  "M818 10c17,0 34,1 50,1l779 317c45,57 80,120 105,188l-62 706c-2,4 -4,7 -7,11 -73,111 -175,198 -306,260l257 375 -27 306 -418 0 -393 -575 -244 0 139 -1589 127 0zm-532 2164l-277 0 0 -2164 467 0 -190 2164z";

const LINK = "text-[14.5px] text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-white";
const HEADING =
  "mb-3.5 font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-zinc-500";

async function PublicRoadmapLink() {
  try {
    const roadmap = await RoadmapPublicService.getPublicRoadmap();
    const data = roadmap?.message || roadmap;
    if (data && data.title) {
      return (
        <li>
          <Link href="/public/roadmap" className={LINK}>
            {t("footer.roadmap")}
          </Link>
        </li>
      );
    }
  } catch (e) {}
  return null;
}

export async function Footer() {
  const footerChrome: FooterChromeConfig = {
    ...FOOTER_CHROME,
    links: legalFooterLinks(await listPublicTerms(), t("footer.legal")),
  };

  let hasCareers = false;
  try {
    const jobs = await JobsService.getOpenings();
    if (jobs && jobs.length > 0) hasCareers = true;
  } catch (e) {}

  return (
    <footer className="border-t border-zinc-200 bg-white pb-10 pt-14 text-zinc-600 dark:border-zinc-800 dark:bg-[hsl(240_10%_3.9%)] dark:text-zinc-400">
      <div className="mx-auto max-w-[1280px] px-[clamp(16px,4vw,56px)]">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 text-[22px] font-extrabold tracking-[0.06em] text-zinc-950 dark:text-white">
              <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-primary">
                <svg viewBox="0 0 1760 2184" aria-hidden="true" className="h-[19px] w-[15px] fill-black">
                  <path d={R_PATH} />
                </svg>
              </span>
              ROKCT
            </Link>
            <p className="mt-3.5 max-w-[34ch] text-[14.5px] text-zinc-500">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className={HEADING}>{t("footer.platform")}</h4>
            <ul className="grid gap-2.5">
              <li>
                <Link href="/landing#platform" className={LINK}>
                  {t("footer.modules")}
                </Link>
              </li>
              <li>
                <Link href="/landing#plans" className={LINK}>
                  {t("footer.plans")}
                </Link>
              </li>
              <li>
                <Link href="/landing#funding" className={LINK}>
                  {t("footer.funding")}
                </Link>
              </li>
              <li>
                <Link href="/landing#site" className={LINK}>
                  {t("footer.own_site")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={HEADING}>{t("footer.help")}</h4>
            <ul className="grid gap-2.5">
              <PublicRoadmapLink />
              <li>
                <Link href="/status" className={LINK}>
                  {t("footer.status")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={HEADING}>{t("footer.company")}</h4>
            <ul className="grid gap-2.5">
              <li>
                <Link href="/team" className={LINK}>
                  {t("footer.team")}
                </Link>
              </li>
              {hasCareers && (
                <li>
                  <Link href="/careers" className={LINK}>
                    {t("footer.careers")}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* The Rokct network (base_sdk network strip, footer placement):
            agent_sdk 1.24.0 turns it off on rokct.ai, so it draws nothing. */}
        <NetworkStrip surface="footer" />

        {/* Footer Bottom: the site credit, platform status, version and the
            Legal group - base's footer chrome row. */}
        <FooterChromeRow
          config={footerChrome}
          networkStrip={false}
          className="mt-12 border-t border-zinc-200 pt-6 text-[13px] dark:border-zinc-800 [&_[data-site-credit-maker]_[role=img]]:text-red-500"
        />
      </div>
    </footer>
  );
}
