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
import { AI_FIRST } from "@/app/config/compose";
import { Chat } from "@/components/custom/chat";
import { PaaSLogin } from "@/components/custom/paas-login";
import { generateUUID } from "@/lib/utils";

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

  // Compose-time gate: without the agent SDK there is no chat surface, so
  // authenticated (non-PaaS) users land on the hands-on workspace instead.
  // PaaS users never reach this page — auth.config.ts redirects them earlier.
  if (!AI_FIRST) {
    redirect("/handson");
  }

  // Redirect immediately to a brand new clean chat session
  redirect(`/chat/${generateUUID()}`);
}
