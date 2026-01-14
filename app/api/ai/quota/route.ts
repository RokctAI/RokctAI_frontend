import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";
import { getModel } from "@/ai";
import { generateText } from "ai";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!session.user.isPaaS || !session.user.apiKey || !session.user.apiSecret) {
        // Non-PaaS / Dev users are assumed to be unlimited for now
        return Response.json({
            daily_flash_remaining: 1000,
            is_flash_unlimited: true,
            allowed: true
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
        if (e.message?.includes("429") || e.message?.includes("402") || e.message?.includes("Quota")) {
            googleQuota = false;
        }
        // If it's a transient 500, we might want to allow it (fail open) vs fail closed.
        // But for "Quota", we fail closed.
    }

    try {
        const usageRes = await fetch(`${process.env.ROKCT_BASE_URL}/api/method/rokct.rokct.tenant.api.get_token_usage`, {
            headers: {
                "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`
            }
        });

        if (usageRes.ok) {
            const usageData = await usageRes.json();
            const { daily_flash_remaining, is_flash_unlimited } = usageData.message || {};

            // Allowed if BOTH Google is healthy AND Internal Quota is remaining
            const allowed = googleQuota && (is_flash_unlimited || (daily_flash_remaining > 0));

            return Response.json({
                daily_flash_remaining,
                is_flash_unlimited,
                allowed,
                google_healthy: googleQuota
            });
        }
    } catch (error) {
        console.error("Quota Check Failed", error);
    }

    // Fail safe to allowed if backend is down? Or blocked? 
    // Let's block to prevent abuse if we can't verify.
    return Response.json({ allowed: false, error: "Could not verify quota" }, { status: 500 });
}
