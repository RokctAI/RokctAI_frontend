import { auth } from "@/app/(auth)/auth";

export const ACTION_TOKEN_COST = 50; // Flat fee for AI actions

export async function recordTokenUsage(session: any, tokens: number, model: string) {
    if (!session || !session.user || !session.user.isPaaS || !session.user.apiKey || !session.user.apiSecret) {
        return;
    }

    try {
        await fetch(`${process.env.ROKCT_BASE_URL}/api/method/core.tenant.api.record_token_usage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`
            },
            body: JSON.stringify({
                tokens_used: tokens,
                model_name: model
            })
        });
    } catch (e) {
        console.error("Failed to record usage", e);
    }
}


export async function checkTokenQuota(session: any): Promise<boolean> {
    if (!session || !session.user || !session.user.isPaaS || !session.user.apiKey || !session.user.apiSecret) {
        // Decide policy for non-PaaS: Allow or Block?
        // Assuming Dev/Internal are allowed.
        return true;
    }

    try {
        const usageRes = await fetch(`${process.env.ROKCT_BASE_URL}/api/method/core.tenant.api.get_token_usage`, {
            headers: {
                "Authorization": `token ${session.user.apiKey}:${session.user.apiSecret}`
            },
            cache: 'no-store'
        });

        if (usageRes.ok) {
            const usageData = await usageRes.json();
            const { daily_flash_remaining, is_flash_unlimited } = usageData.message || {};

            if (is_flash_unlimited) return true;
            if (daily_flash_remaining >= ACTION_TOKEN_COST) return true;
        }
    } catch (e) {
        console.error("Failed to check quota", e);
    }
    return false;
}
