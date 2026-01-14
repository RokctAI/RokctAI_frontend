"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { verifySystemManager } from "@/app/lib/roles";

// Platform Level Control Actions

export async function broadcastAnnouncement(data: { subject: string, message: string, modelId?: string }) {
    if (!await verifySystemManager()) return { success: false, error: "Unauthorized" };

    const client = await getClient();

    try {
        const response = await client.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Announcement",
                    subject: data.subject,
                    description: data.message,
                    starts_on: new Date().toISOString().split('T')[0],
                    is_public: 1
                }
            }
        });
        return { success: true, message: "Announcement broadcasted successfully." };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

export async function getGlobalSettings(data: { modelId?: string } = {}) {
    if (!await verifySystemManager()) return { success: false, error: "Unauthorized" };

    const client = await getClient();

    try {
        const settings = await client.call({
            method: "frappe.client.get_singles",
            args: { doctype: "System Settings" }
        });
        // Filter sensitive data? For System Manager it is fine.
        return { success: true, settings: settings };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}
