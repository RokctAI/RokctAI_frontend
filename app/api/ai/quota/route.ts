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

import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";
import { getModel } from "@/ai";
import { generateText } from "ai";
import { getAuthenticatedTokens } from "@/app/lib/auth-utils";
import { platformCall } from "@/app/services/base/platform-gateway";

// Token rotation and renewal are handled by getAuthenticatedTokens() which calls refreshTokens() before expiry.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  let tokens;
  try {
    tokens = await getAuthenticatedTokens();
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!session.user.apiKey || !session.user.apiSecret) {
    // Sessions without platform API credentials have no tenant quota
    // backend — assumed to be unlimited for now
    return Response.json({
      daily_flash_remaining: 1000,
      is_flash_unlimited: true,
      allowed: true,
    });
  }

  // 2. Google Health Check (Ping)
  // We try to generate 1 token to see if the key is valid and has quota.
  let googleQuota = true;
  try {
    await generateText({
      model: getModel(AI_MODELS.FREE.id),
      prompt: " ",
    });
  } catch (e: any) {
    console.error("Google Health Check Failed", e);
    // 429 = Quota Exceeded, 402 = Payment Required, 400 = Bad Request (Key issues)
    if (
      e.message?.includes("429") ||
      e.message?.includes("402") ||
      e.message?.includes("Quota")
    ) {
      googleQuota = false;
    }
    // If it's a transient 500, we might want to allow it (fail open) vs fail closed.
    // But for "Quota", we fail closed.
  }

  try {
    // Universal gateway call — cmd is the prefix-free subscriptions
    // manifest key (`{app_name}.tenant.api.get_token_usage`).
    const usageData = await platformCall<any>(
      "tenant.api.get_token_usage",
      undefined,
      {
        headers: {
          Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
        },
      },
    );

    if (usageData) {
      const { daily_flash_remaining, is_flash_unlimited } = usageData;

      // Allowed if BOTH Google is healthy AND Internal Quota is remaining
      const allowed =
        googleQuota && (is_flash_unlimited || daily_flash_remaining > 0);

      return Response.json({
        daily_flash_remaining,
        is_flash_unlimited,
        allowed,
        google_healthy: googleQuota,
      });
    }
  } catch (error) {
    console.error("Quota Check Failed", error);
  }

  // Fail safe to allowed if backend is down? Or blocked?
  // Let's block to prevent abuse if we can't verify.
  return Response.json(
    { allowed: false, error: "Could not verify quota" },
    { status: 500 },
  );
}
