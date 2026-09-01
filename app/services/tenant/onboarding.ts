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

import { getClient } from "@/app/lib/client";

export class OnboardingService {
  /**
   * Commits the completed onboarding answers to the tenant site.
   */
  static async commitOnboardingAnswers(args: {
    profile_type: "business" | "life";
    instance_name: string;
    answers: Record<string, any>;
    milestones?: any[];
  }) {
    const client = await getClient();
    return (client as any).call({
      method: "rcore.api.plan_builder.commit_onboarding_answers",
      args: {
        profile_type: args.profile_type,
        instance_name: args.instance_name,
        answers: JSON.stringify(args.answers),
        milestones: JSON.stringify(args.milestones || []),
      },
    });
  }

  /**
   * Sends a message to the secure ROK chat bridge on the Tenant VPS.
   */
  static async chatWithRok(
    message: string,
    sessionId?: string,
    model?: string,
  ) {
    const client = await getClient();
    return (client as any).call({
      method: "rcore.api.plan_builder.chat_with_rok",
      args: {
        message,
        session_id: sessionId,
        model,
      },
    });
  }
}
