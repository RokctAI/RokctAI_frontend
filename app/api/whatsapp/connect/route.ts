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
 * Serverless / Edge API Route to proxy the Host-Level CBB SSE connection
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

  const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL;
  if (!BRIDGE_URL) {
    return new Response(JSON.stringify({ error: "WhatsApp Bridge URL is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const targetUrl = `${BRIDGE_URL}/sessions/init?tenantId=${tenantId}`;

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to connect to centralized WhatsApp bridge" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Set headers for Server-Sent Events (SSE)
    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    // Return the response body stream directly
    return new Response(response.body, { headers });
  } catch (err: any) {
    console.error("WhatsApp bridge routing error:", err);
    return new Response(
      JSON.stringify({ error: `Bridge communication failed: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
