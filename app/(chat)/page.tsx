/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
