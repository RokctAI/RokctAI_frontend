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

// /legal/<id> - one legal document (corporate_sdk 1.0.0), the Next.js
// counterpart of the Dart corporate_sdk's TermPage / PolicyPage and of
// rokct.ai's hand-rolled app/legal/[id]/page.tsx. A server component: the
// document is read on the server through `loadLegalDoc` (the one seam
// 1.1.0 extends with the shell's data/ folder), the first HTML carries the
// words, and a missing or disabled document is a 404. Since 1.2.0 the
// page sits in the shell's site frame (base_sdk 1.47.0's SiteFrame)
// whenever the home SDK registered one, and in its own LegalFrame
// otherwise.

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/app/lib/site-metadata";
import { getPlatformSession } from "@/app/services/base/session";
import { resolveSiteFrame } from "@/components/custom/landing/site-frame";
import { LegalDocView } from "@/components/custom/legal/legal-doc";
import { LegalFrame } from "@/components/custom/legal/legal-frame";
import {
  loadLegalDoc,
  loadLegalIndex,
} from "@/components/custom/legal/load-legal-doc";
import { SiteFrame } from "@/components/custom/site-frame";
import { siteDataMode } from "@/lib/site-data/read-site-data";

export const dynamic = "force-dynamic";

interface LegalDocPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: LegalDocPageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await loadLegalDoc(decodeURIComponent(id));
  if (!doc) return buildPageMetadata();
  return buildPageMetadata({ title: doc.title });
}

export default async function LegalDocPage({ params }: LegalDocPageProps) {
  const { id } = await params;
  const dataMode = siteDataMode();
  const session = await getPlatformSession();
  const [doc, terms, frame] = await Promise.all([
    loadLegalDoc(decodeURIComponent(id)),
    loadLegalIndex(),
    resolveSiteFrame({ plans: [], session, dataMode }),
  ]);
  if (!doc) notFound();
  if (!frame.registered) return <LegalFrame terms={terms}><LegalDocView doc={doc} /></LegalFrame>;
  return (
    <SiteFrame frame={frame} page="legal" session={session} dataMode={dataMode}>
      <LegalDocView doc={doc} />
    </SiteFrame>
  );
}
