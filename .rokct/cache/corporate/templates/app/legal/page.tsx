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

// /legal - the index of the shell's published legal documents
// (corporate_sdk 1.0.0): every enabled document, one link each, read on
// the server through `loadLegalIndex` (the seam 1.1.0 extends with the
// shell's data/ folder). Nothing published lists nothing, with one plain
// line saying so, and the page still answers 200. Since 1.2.0 the page
// sits in the shell's site frame (base_sdk 1.47.0's SiteFrame) whenever
// the home SDK registered one, and in its own LegalFrame otherwise.

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/app/lib/site-metadata";
import { getPlatformSession } from "@/app/services/base/session";
import {
  DEFAULT_LEGAL_GROUP_LABEL,
  legalDocHref,
} from "@/components/custom/landing/legal-links";
import { resolveSiteFrame } from "@/components/custom/landing/site-frame";
import { LegalFrame } from "@/components/custom/legal/legal-frame";
import { loadLegalIndex } from "@/components/custom/legal/load-legal-doc";
import { SiteFrame } from "@/components/custom/site-frame";
import { siteDataMode } from "@/lib/site-data/read-site-data";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ title: DEFAULT_LEGAL_GROUP_LABEL });
}

export default async function LegalIndexPage() {
  const dataMode = siteDataMode();
  const session = await getPlatformSession();
  const [terms, frame] = await Promise.all([
    loadLegalIndex(),
    resolveSiteFrame({ plans: [], session, dataMode }),
  ]);
  const body = (
    <section className="mx-auto w-full max-w-3xl px-4 py-12" data-legal-index="">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        {DEFAULT_LEGAL_GROUP_LABEL}
      </h1>
      {terms.length === 0 ? (
        <p className="opacity-70">No legal documents have been published yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {terms.map((term) => (
            <li key={term.name}>
              <Link
                href={legalDocHref(term.name)}
                className="text-lg underline-offset-4 hover:underline"
              >
                {term.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
  if (!frame.registered) return <LegalFrame terms={terms} indexLink={false}>{body}</LegalFrame>;
  return (
    <SiteFrame frame={frame} page="legal" session={session} dataMode={dataMode}>
      {body}
    </SiteFrame>
  );
}
