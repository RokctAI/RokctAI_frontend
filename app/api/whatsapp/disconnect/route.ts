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

/**
 * Author: ROKCT Code Generator
 * Client-facing API route to disconnect the Centralized WhatsApp Bridge session
 */

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json();

    if (!tenantId) {
      return new Response(JSON.stringify({ error: "tenantId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL;
    if (!BRIDGE_URL) {
      return new Response(
        JSON.stringify({ error: "WhatsApp Bridge URL is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

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
      },
    );
  }
}
