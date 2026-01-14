import { FrappeApp } from "frappe-js-sdk";

export function getFrappeClient({ apiKey, apiSecret, url }: { apiKey?: string; apiSecret?: string; url?: string } = {}) {
    const frappeUrl = url || process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL || "";

    if (apiKey && apiSecret) {
        return new FrappeApp(frappeUrl, {
            useToken: true,
            token: () => `${apiKey}:${apiSecret}`,
            type: "token",
        });
    }

    return new FrappeApp(frappeUrl);
}

export const db = () => getFrappeClient().db();
