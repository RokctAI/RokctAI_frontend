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

import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";
import { getModel } from "@/ai";
import { generateText } from "ai";
import { getAuthenticatedTokens } from "@/app/lib/auth-utils";

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

  if (!session.user.isPaaS || !session.user.apiKey || !session.user.apiSecret) {
    // Non-PaaS / Dev users are assumed to be unlimited for now
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
    const usageRes = await fetch(
      `${process.env.ROKCT_BASE_URL}/api/method/core.tenant.api.get_token_usage`,
      {
        headers: {
          Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
        },
      },
    );

    if (usageRes.ok) {
      const usageData = await usageRes.json();
      const { daily_flash_remaining, is_flash_unlimited } =
        usageData.message || {};

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
