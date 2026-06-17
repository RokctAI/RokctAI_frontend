import { generateText } from "ai";
import { z } from "zod";
import { getModel } from "@/ai";
import { AI_MODELS } from "@/ai/models";
import { auth } from "@/app/(auth)/auth";
import { getAuthenticatedTokens } from "@/app/lib/auth-utils";
import t from "@/app/lib/i18n";

// Token rotation and renewal are handled by getAuthenticatedTokens() which calls refreshTokens() before expiry.
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    let tokens;
    try {
      tokens = await getAuthenticatedTokens();
    } catch (e) {
      return new Response(t('api.unauthorized'), { status: 401 });
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
      return new Response(t('api.unauthorized'), { status: 401 });
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
      return new Response(t('api.upgrade_pro'), {
        status: 403,
      });
    }

    // Check Token Balance if PaaS
    if (
      session?.user?.apiKey &&
      session?.user?.apiSecret &&
      session?.user?.isPaaS
    ) {
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

           if (is_flash_unlimited || daily_flash_remaining > 0) {
             allowRequest = true;
           } else {
             return new Response(t('api.quota_exceeded'), { status: 402 });
           }
         } else {
           // Fallback if API fails? For now, block to be safe or allow if lax.
           // Let's assume block if we can't verify quota.
           console.error(t('api.quota_verify_failed'), "Failed to fetch quota");
           return new Response(t('api.quota_verify_failed'), { status: 500 });
         }
       } catch (e) {
         console.error(t('api.quota_check_failed'), "Quota check error", e);
         return new Response(t('api.quota_check_failed'), { status: 500 });
       }
    } else {
      // Dev / Non-PaaS fallback
      allowRequest = true;
    }

    if (!allowRequest) {
      return new Response(t('api.quota_exceeded_generic'), { status: 402 });
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

      // Log to Backend
      if (session.user.apiKey && session.user.apiSecret) {
            fetch(
              `${process.env.ROKCT_BASE_URL}/api/method/core.tenant.api.log_frontend_error`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
                },
                body: JSON.stringify({
                  error_message:
                    error instanceof Error ? error.message : t('api.error_log'),
                  context: JSON.stringify({
                    route: "api/ai/text",
                    prompt_type: promptType,
                    user: session.user.email,
                  }),
                }),
              },
    ).catch((e) => console.error(t('api.error_log'), e));
  }

       // Fallback to Manual Mode
       return new Response(t('api.ai_unavailable'), {
         status: 503,
       });
    }

    // 4. Record Usage
    if (
      tokensUsed > 0 &&
      session.user.isPaaS &&
      session.user.apiKey &&
      session.user.apiSecret
    ) {
      // Fire and forget usage recording
      fetch(
        `${process.env.ROKCT_BASE_URL}/api/method/core.tenant.api.record_token_usage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${session.user.apiKey}:${session.user.apiSecret}`,
          },
          body: JSON.stringify({
            tokens_used: tokensUsed,
            model_name: usedModel,
          }),
        },
    ).catch((e) => console.error(t('api.error_record'), e));
  }

    return Response.json({ text: generatedText });
  } catch (error) {
    console.error("AI Text Error", error);
    return new Response(t('api.internal_error'), { status: 500 });
  }
}
