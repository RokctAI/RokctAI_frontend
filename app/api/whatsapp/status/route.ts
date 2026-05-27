/**
 * Author: ROKCT Code Generator
 * Client-facing API route to check the Centralized WhatsApp Bridge connection status
 */

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return new Response(JSON.stringify({ error: "tenantId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL || "http://localhost:9000";

  try {
    const res = await fetch(`${BRIDGE_URL}/sessions/status?tenantId=${tenantId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Bridge connection failed");
    
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.warn("WhatsApp bridge status check failed:", err.message);
    return new Response(
      JSON.stringify({ connected: false, initialized: false, error: err.message }),
      {
        status: 200, // Return standard JSON to prevent client-side throws
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
