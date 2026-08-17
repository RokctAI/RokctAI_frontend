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

import "server-only";

import { getCurrentSession } from "@/app/(auth)/actions";
import { getFrappeClient } from "@/lib/frappe";
import { db } from "@/db";
import { globalSettings } from "@/db/schema";

export async function getPaaSClient() {
  const session = await getCurrentSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const apiKey = (session.user as any).apiKey;
  const apiSecret = (session.user as any).apiSecret;
  const siteName = (session.user as any).siteName;

  // Ensure siteName is a full URL if present
  let url = siteName;
  if (siteName && !siteName.startsWith("http")) {
    url = siteName.includes("localhost")
      ? `http://${siteName}`
      : `https://${siteName}`;
  }

  // If url is undefined/null, getFrappeClient will fall back to process.env.NEXT_PUBLIC_FRAPPE_URL
  return getFrappeClient({ apiKey, apiSecret, url });
}

export async function getControlClient() {
  const session = await getCurrentSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const apiKey = (session.user as any).apiKey;
  const apiSecret = (session.user as any).apiSecret;

  // Explicitly ignore siteName from session to ensure we connect to the Control Plane (default URL)
  // getFrappeClient falls back to process.env.NEXT_PUBLIC_FRAPPE_URL if url is undefined
  return getFrappeClient({ apiKey, apiSecret });
}

// Default export for backward compatibility if needed, but prefer named exports
export default getPaaSClient;
export const getClient = getPaaSClient;

/**
 * System Client for Control Plane access (No User Session required).
 * Used for fetching global configurations (Workflows, Terms) on behalf of Tenant Users.
 * Reads Admin Keys from GlobalSettings (requires Admin to have logged in once).
 */
export async function getSystemControlClient() {
  let apiKey: string | undefined;
  let apiSecret: string | undefined;

  try {
    const settings = await db.select().from(globalSettings).limit(1);
    if (settings.length > 0) {
      apiKey = settings[0].adminApiKey || undefined;
      apiSecret = settings[0].adminApiSecret || undefined;
    }
  } catch (e) {
    console.error("Failed to fetch System Keys from DB", e);
  }

  if (!apiKey || !apiSecret) {
    throw new Error(
      "System Identity not initialized. Please Log In as Administrator first to save keys.",
    );
  }

  return getFrappeClient({ apiKey, apiSecret });
}

export function getGuestClient() {
  return getFrappeClient();
}
