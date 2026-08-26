/*
 * Copyright (c) 2026 RokctAI
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

import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { platformCall } from "@/app/services/base/platform-gateway";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitor_id } = body;

    if (!visitor_id) {
      return NextResponse.json(
        { success: false, error: "visitor_id is required" },
        { status: 400 },
      );
    }

    // Resolve client IP address
    const client_ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Get current session
    const session = await auth();
    const siteName = session?.user ? (session.user as any).siteName : null;
    const user_id = session?.user?.email || null;

    if (siteName) {
      // User is authenticated on a tenant site.
      // FLAGGED — cannot ride the gateway: no tenant-role SDK manifest
      // declares a record_unique_visit alias (the telemetry module only
      // registers it control-side), so there is no verifiable cmd for
      // this leg. Left on the per-method URL pending a backend alias.
      let host = siteName;
      if (!host.startsWith("http")) {
        host = host.includes("localhost")
          ? `http://${host}`
          : `https://${host}`;
      }
      const targetUrl = `${host}/api/method/rcore.tenant.api.record_unique_visit`;

      // Call Frappe API endpoint (whitelisted with allow_guest=True)
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitor_id,
          client_ip,
          user_id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to report visitor to ${targetUrl}:`, errorText);
        return NextResponse.json(
          { success: false, error: "Backend failed to record visit" },
          { status: 502 },
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    // Guest visitor on control panel — universal gateway call; the control
    // gateway only serves `control:`-prefixed cmds, and this is the
    // telemetry manifest's `control:record_unique_visit` key.
    const host =
      process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL || "";
    const data = await platformCall(
      "control:record_unique_visit",
      {
        visitor_id,
        client_ip,
        user_id,
      },
      { baseUrl: host },
    );

    if (data === null) {
      console.error("Failed to report visitor to control gateway");
      return NextResponse.json(
        { success: false, error: "Backend failed to record visit" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in visitor api route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
