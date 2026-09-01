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
