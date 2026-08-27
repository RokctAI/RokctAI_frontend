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

import { generateText } from "ai";
import { z } from "zod";
import { getModel } from "@/ai";
import { AI_MODELS } from "@/ai/models";
import { auth } from "@/app/(auth)/auth";
import { getAuthenticatedTokens } from "@/app/lib/auth-utils";
import t from "@/app/lib/i18n";
import { platformCall } from "@/app/services/base/platform-gateway";

// Token rotation and renewal are handled by getAuthenticatedTokens() which calls refreshTokens() before expiry.
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    let tokens;
    try {
      tokens = await getAuthenticatedTokens();
    } catch (e) {
      return new Response(t("api.unauthorized"), { status: 401 });
    }

    const {
      text,
      promptType,
      customPrompt,
    }: {
      text: string;
      promptType: "grammar" | "professional" | "expand" | "custom";
      customPrompt?: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user) {
      return new Response(t("api.unauthorized"), { status: 401 });
    }

    // 1. Quota Check (Simulated for now based on existing route.ts logic pattern)
    // In a real Paywall scenario, we'd block strictly here.
    let allowRequest = false;
    const isPaidUser =
      !session?.user?.is_free_plan &&
      (session?.user?.status === "Active" ||
        session?.user?.status === "Trialing");

    // Strictly block Free users for this feature as per plan
    if (!isPaidUser) {
      return new Response(t("api.upgrade_pro"), {
        status: 403,
      });
    }

    // Check Token Balance when the session carries platform API credentials
    if (session?.user?.apiKey && session?.user?.apiSecret) {
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

          if (is_flash_unlimited || daily_flash_remaining > 0) {
            allowRequest = true;
          } else {
            return new Response(t("api.quota_exceeded"), { status: 402 });
          }
        } else {
          // Fallback if API fails? For now, block to be safe or allow if lax.
          // Let's assume block if we can't verify quota.
          console.error(t("api.quota_verify_failed"), "Failed to fetch quota");
          return new Response(t("api.quota_verify_failed"), { status: 500 });
        }
      } catch (e) {
        console.error(t("api.quota_check_failed"), "Quota check error", e);
        return new Response(t("api.quota_check_failed"), { status: 500 });
      }
    } else {
      // Dev / no-credentials fallback
      allowRequest = true;
    }

    if (!allowRequest) {
      return new Response(t("api.quota_exceeded_generic"), { status: 402 });
    }

    // 2. Construct Prompt
    let systemPrompt =
      "You are a helpful AI writing assistant. Return ONLY the modified text. Do not add quotes or explanations.";
    let userPrompt = text;

    switch (promptType) {
      case "grammar":
        systemPrompt += " Fix grammar and spelling errors.";
        break;
      case "professional":
        systemPrompt += " Rewrite this to sound more professional and concise.";
        break;
      case "expand":
        systemPrompt +=
          " Expand on this text, adding relevant detail while keeping the same tone.";
        break;
      case "custom":
        systemPrompt += ` Follow this instruction: ${customPrompt}`;
        break;
    }

    // 3. Generate
    // We use the Flash model (Free Key) for high speed text helper tasks.
    let generatedText = "";
    let tokensUsed = 0;
    let usedModel = AI_MODELS.FREE.id; // "gemini-2.5-flash"

    try {
      const { text, usage } = await generateText({
        model: getModel(AI_MODELS.FREE.id),
        system: systemPrompt,
        prompt: userPrompt,
      });
      generatedText = text;
      tokensUsed = usage.totalTokens || 0;
    } catch (error) {
      console.error("Gemini Flash Failed", error);

      // Log to Backend — prefix-free telemetry manifest cmd
      // (`{app_name}.tenant.api.log_frontend_error`) via the gateway.
      if (session.user.apiKey && session.user.apiSecret) {
        platformCall(
          "tenant.api.log_frontend_error",
          {
            error_message:
              error instanceof Error ? error.message : t("api.error_log"),
            context: JSON.stringify({
              route: "api/ai/text",
              prompt_type: promptType,
              user: session.user.email,
            }),
          },
          {
            headers: {
              Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
            },
          },
        ).catch((e) => console.error(t("api.error_log"), e));
      }

      // Fallback to Manual Mode
      return new Response(t("api.ai_unavailable"), {
        status: 503,
      });
    }

    // 4. Record Usage
    if (tokensUsed > 0 && session.user.apiKey && session.user.apiSecret) {
      // Fire and forget usage recording — prefix-free subscriptions
      // manifest cmd (`{app_name}.tenant.api.record_token_usage`).
      platformCall(
        "tenant.api.record_token_usage",
        {
          tokens_used: tokensUsed,
          model_name: usedModel,
        },
        {
          headers: {
            Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
          },
        },
      ).catch((e) => console.error(t("api.error_record"), e));
    }

    return Response.json({ text: generatedText });
  } catch (error) {
    console.error("AI Text Error", error);
    return new Response(t("api.internal_error"), { status: 500 });
  }
}
