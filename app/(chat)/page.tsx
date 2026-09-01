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

import { redirect } from "next/navigation";

import { getCurrentSession } from "@/app/(auth)/actions";
import { PaaSLogin } from "@/components/custom/paas-login";

// Bare-shell root route. The chat surface lives in the agent SDK; when that
// SDK is composed in, its installer overwrites this file with the full chat
// home (and its manifest flips AI_FIRST via the compose-flags marker). Keep
// this file at app/(chat)/page.tsx — moving it to app/page.tsx would collide
// with the SDK-installed copy at compose time (two "/" routes).
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    const params = await searchParams;
    const siteName = params?.site_name;

    if (!siteName) {
      redirect("/landing");
    }

    return <PaaSLogin />;
  }

  // Authenticated (non-PaaS) users land on the hands-on workspace — AI_FIRST
  // is false in the bare shell, so there is no chat surface to route to.
  // PaaS users never reach this page — auth.config.ts redirects them earlier.
  redirect("/handson");
}
