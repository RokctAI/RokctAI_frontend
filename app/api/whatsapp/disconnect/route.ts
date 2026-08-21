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
