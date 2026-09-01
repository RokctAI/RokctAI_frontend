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
