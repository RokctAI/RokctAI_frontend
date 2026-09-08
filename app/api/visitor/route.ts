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

    // Get current session (only for the optional user_id on the record).
    const session = await auth();
    const user_id = session?.user?.email || null;

    // Every visit — guest or signed-in tenant user — goes to the control
    // plane's unique-visit counter through the ONE platform gateway
    // (`control:record_unique_visit`, the telemetry manifest's control-role
    // cmd, also in control's override_whitelisted_methods). The former
    // tenant leg POSTed a per-method URL
    // (`/api/method/rcore.tenant.api.record_unique_visit`) at the tenant
    // site, where no tenant-role manifest registers that method, so it
    // could never succeed; the control counter is the only sink for this
    // record. The cmd is allow_guest, so no session credentials are sent.
    const host =
      process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL || "";
    const data = await platformCall(
      "control:record_unique_visit",
      {
        visitor_id,
        client_ip,
        user_id,
      },
      { baseUrl: host, requireAuth: false },
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
