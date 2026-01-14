'use server'

import { getControlClient } from "@/app/lib/client";

export async function getClientUsage() {
    try {
        const client = await getControlClient();
        const response = await client.call('rpanel.hosting.doctype.hosting_client.hosting_client.get_client_usage');
        return response.message || response;
    } catch (error: any) {
        console.error("Error fetching client usage:", error);
        return { success: false, error: error.message || "Failed to fetch client usage" };
    }
}
