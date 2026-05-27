/**
 * Author: ROKCT Code Generator
 * Client-facing API route to disconnect the Centralized WhatsApp Bridge session
 */

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json();

    if (!tenantId) {
      return new Response(JSON.stringify({ error: "tenantId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL || "http://localhost:9000";

    const res = await fetch(`${BRIDGE_URL}/sessions/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });

    if (!res.ok) throw new Error("Disconnection request failed");

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("WhatsApp bridge disconnect error:", err);
    return new Response(
      JSON.stringify({ error: `Disconnection failed: ${err.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
