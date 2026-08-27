/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import { platformCall } from "@/app/services/base/platform-gateway";

export const ACTION_TOKEN_COST = 50; // Flat fee for AI actions

export async function recordTokenUsage(
  session: any,
  tokens: number,
  model: string,
) {
  // Sessions without platform API credentials (no tenant backend to bill
  // against) have nothing to record.
  if (
    !session ||
    !session.user ||
    !session.user.apiKey ||
    !session.user.apiSecret
  ) {
    return;
  }

  try {
    // Universal gateway call — cmd is the prefix-free subscriptions
    // manifest key (`{app_name}.tenant.api.record_token_usage`).
    await platformCall(
      "tenant.api.record_token_usage",
      {
        tokens_used: tokens,
        model_name: model,
      },
      {
        headers: {
          Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
        },
      },
    );
  } catch (e) {
    console.error("Failed to record usage", e);
  }
}

export async function checkTokenQuota(session: any): Promise<boolean> {
  if (
    !session ||
    !session.user ||
    !session.user.apiKey ||
    !session.user.apiSecret
  ) {
    // No platform API credentials means no tenant quota backend to check —
    // Dev/Internal sessions are allowed.
    return true;
  }

  try {
    // Universal gateway call — cmd is the prefix-free subscriptions
    // manifest key (`{app_name}.tenant.api.get_token_usage`).
    const usage = await platformCall<any>(
      "tenant.api.get_token_usage",
      undefined,
      {
        headers: {
          Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
        },
        fetchOptions: { cache: "no-store" },
      },
    );

    if (usage) {
      const { daily_flash_remaining, is_flash_unlimited } = usage;

      if (is_flash_unlimited) return true;
      if (daily_flash_remaining >= ACTION_TOKEN_COST) return true;
    }
  } catch (e) {
    console.error("Failed to check quota", e);
  }
  return false;
}
