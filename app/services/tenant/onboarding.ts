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

import { platformCall } from "@/app/services/base/platform-gateway";

export class OnboardingService {
  /**
   * Commits the completed onboarding answers to the tenant site.
   *
   * Rides the ONE platform gateway (ADR-005), never a per-method URL:
   * `cmd` is the dotted manifest key with the app prefix stripped, per the
   * contract in app/lib/gateway-rpc.ts.
   *
   * It has to, because what it replaced never made a request at all.
   * `FrappeApp.call()` takes ZERO arguments and returns a `FrappeCall`
   * (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so the object
   * handed to it was discarded, no HTTP request was issued, and the caller
   * received that `FrappeCall` builder. The `as any` is what let it
   * compile. `throwOnError` keeps the old axios semantics: a gateway
   * failure reaches the caller as an exception rather than a silent `null`.
   */
  static async commitOnboardingAnswers(args: {
    profile_type: "business" | "life";
    instance_name: string;
    answers: Record<string, any>;
    milestones?: any[];
  }) {
    return platformCall<Record<string, any>>(
      "api.plan_builder.commit_onboarding_answers",
      {
        profile_type: args.profile_type,
        instance_name: args.instance_name,
        answers: JSON.stringify(args.answers),
        milestones: JSON.stringify(args.milestones || []),
      },
      { throwOnError: true },
    );
  }

  /**
   * Sends a message to the secure ROK chat bridge on the Tenant VPS.
   *
   * Same gateway, same reason as above — this one never reached ROK
   * either. `platformCall` unwraps Frappe's single top-level `message`
   * envelope, which is what the chat consumer wants: the target method
   * returns `{status, message, tool_calls}`, so `res.message` is the
   * reply text rather than the whole envelope.
   */
  static async chatWithRok(
    message: string,
    sessionId?: string,
    model?: string,
  ) {
    return platformCall<Record<string, any>>(
      "api.plan_builder.chat_with_rok",
      {
        message,
        session_id: sessionId,
        model,
      },
      { throwOnError: true },
    );
  }
}
