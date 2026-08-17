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
  static async chatWithRok(message: string, sessionId?: string, model?: string) {
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

