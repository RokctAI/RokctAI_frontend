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
import { PLATFORM_NAME, LEGAL_COMPANY_NAME } from "@/app/config/platform";
import { PLATFORM_FEATURES } from "@/app/config/features";
import { TermsService } from "@/app/services/control/terms";
import { JobsService } from "@/app/services/control/jobs";
import { BrandLogo } from "./brand-logo";
import { Branding } from "./branding";
import { RoadmapPublicService } from "@/app/services/public/roadmap";
import {
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  ChevronDown,
} from "lucide-react";
import t from "@/app/lib/i18n";
import { Button } from "@/components/ui/button";
import versionData from "@/version.json";

async function PublicRoadmapLink() {
  try {
    const roadmap = await RoadmapPublicService.getPublicRoadmap();
    const data = roadmap?.message || roadmap;
    if (data && data.title) {
      return (
        <Link
          href="/public/roadmap"
          className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
        >
          {t("footer.roadmap")}
        </Link>
      );
    }
  } catch (e) {}
  return null;
}

export async function Footer() {
  let terms: any[] = [];
  try {
    const fetchedTerms = await TermsService.getMasterTerms();
    if (Array.isArray(fetchedTerms)) terms = fetchedTerms;
  } catch (e) {}

  let isOnline = false;

  try {
    const { VersionsService } = await import("@/app/services/public/versions");
    const versions = await VersionsService.getPublicVersions();
    if (versions) {
      isOnline = true;
    }
  } catch (e) {}

  let hasCareers = false;
  try {
    const jobs = await JobsService.getOpenings();
    if (jobs && jobs.length > 0) hasCareers = true;
  } catch (e) {}

  // Helper to find term by likely title or name
  const getTermLink = (preferredTitle: string) => {
    const term = terms.find(
      (t) =>
        t.title?.toLowerCase().includes(preferredTitle.toLowerCase()) ||
        t.name?.toLowerCase().includes(preferredTitle.toLowerCase()),
    );
    if (term) return `/legal/${term.name}`;
    return "#";
  };

  // Helper to render premium badges dynamically
  const renderBadge = (id: number) => {
    const label = PLATFORM_FEATURES[id]?.label;
    if (!label || label === "none") return null;

    if (label === "soon") {
      return (
        <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none ml-2">
          {t("common.soon")}
        </span>
      );
    }

    if (label === "new") {
      return (
        <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none ml-2">
          {t("common.new")}
        </span>
      );
    }

    return null;
  };

  // Helper to render dynamic footer links
  const renderFooterLink = (id: number) => {
    const feature = PLATFORM_FEATURES[id];
    if (!feature || !feature.active) return null;

    if (feature.label === "soon") {
      return (
        <span className="text-base text-gray-400 dark:text-zinc-600 cursor-not-allowed flex items-center gap-2">
          {t(feature.name)} {renderBadge(id)}
        </span>
      );
    }

    return (
      <Link
        href={feature.href}
        className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors flex items-center gap-2"
      >
        {t(feature.name)} {renderBadge(id)}
      </Link>
    );
  };

  const version = versionData.frontend;

  return (
    <footer className="bg-white dark:bg-black text-black dark:text-white pt-24 pb-12 border-t border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-6 max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center h-[64px]">
              <BrandLogo width={64} height={64} showBadge={false} />
              <div className="pl-3 flex items-center pt-1">
                <Branding
                  showBadge={false}
                  className="text-[88px] tracking-tighter leading-none"
                />
              </div>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-[240px]">
              {t("footer.tagline")}
            </p>
            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 rounded-lg text-lg">
              {t("footer.contact_us")}
            </Button>
            <div className="flex gap-6 mt-2">
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {/* Column 2: Productivity & Summary */}
          {(PLATFORM_FEATURES[5]?.active ||
            PLATFORM_FEATURES[6]?.active ||
            PLATFORM_FEATURES[7]?.active ||
            PLATFORM_FEATURES[12]?.active ||
            PLATFORM_FEATURES[13]?.active) && (
            <div className="flex flex-col gap-12">
              {(PLATFORM_FEATURES[5]?.active ||
                PLATFORM_FEATURES[6]?.active ||
                PLATFORM_FEATURES[7]?.active) && (
                <div className="flex flex-col gap-6">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                    {t("header.productivity")}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {renderFooterLink(5)}
                    {renderFooterLink(6)}
                    {renderFooterLink(7)}
                  </div>
                </div>
              )}
              {(PLATFORM_FEATURES[12]?.active ||
                PLATFORM_FEATURES[13]?.active) && (
                <div className="flex flex-col gap-6">
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                    {t("header.summary")}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {renderFooterLink(12)}
                    {renderFooterLink(13)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Column 3: AI Chat & Company */}
          <div className="flex flex-col gap-12">
            {PLATFORM_FEATURES[4]?.active && (
              <div className="flex flex-col gap-6">
                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                  {t("header.ai_chat")}
                </h4>
                <div className="flex flex-col gap-4">{renderFooterLink(4)}</div>
              </div>
            )}
            <div className="flex flex-col gap-6">
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-sm">
                {t("footer.company")}
              </h4>
              <div className="flex flex-col gap-4">
                <Link
                  href="#"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.team")}
                </Link>
                <Link
                  href={getTermLink("Privacy")}
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.privacy_policy")}
                </Link>
                <Link
                  href={getTermLink("Legal")}
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.legal")}
                </Link>
                <Link
                  href={getTermLink("Cookie")}
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.cookie_policy")}
                </Link>
                <Link
                  href={getTermLink("Terms and Conditions")}
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.terms")}
                </Link>
                <Link
                  href="#"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.data_protection")}
                </Link>
                {hasCareers && (
                  <Link
                    href="/careers"
                    className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                  >
                    {t("footer.careers")}
                  </Link>
                )}
                <Link
                  href="#"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.refund_policy")}
                </Link>
              </div>
            </div>
          </div>

          {/* Column 4: AI Tools & Resources */}
          <div className="flex flex-col gap-12">
            {(PLATFORM_FEATURES[8]?.active ||
              PLATFORM_FEATURES[9]?.active ||
              PLATFORM_FEATURES[10]?.active ||
              PLATFORM_FEATURES[11]?.active) && (
              <div className="flex flex-col gap-6">
                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                  {t("header.tools")}
                </h4>
                <div className="flex flex-col gap-4">
                  {renderFooterLink(8)}
                  {renderFooterLink(9)}
                  {renderFooterLink(10)}
                  {renderFooterLink(11)}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-6">
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-sm">
                {t("footer.resources")}
              </h4>
              <div className="flex flex-col gap-4">
                <Link
                  href="#"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.product_wiki")}
                </Link>
                <Link
                  href="#"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.how_it_works")}
                </Link>
                <PublicRoadmapLink />
                <Link
                  href="#"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-black dark:text-white transition-colors"
                >
                  {t("footer.feature_request")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-row justify-between items-center pt-12 border-t border-gray-200 dark:border-white/5 gap-6">
          <p className="text-sm text-gray-500">
            © Copyright {new Date().getFullYear()} - {LEGAL_COMPANY_NAME}
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-2 py-1 md:px-3 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
              <div
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`}
              />
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                <span className="hidden md:inline">
                  {t("system.status_prefix")}{" "}
                </span>
                {isOnline ? t("system.online") : t("system.offline")}
              </span>
            </div>
            <span className="hidden md:inline text-xs font-mono font-bold text-gray-700 uppercase">
              {t("system.version")} {version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
