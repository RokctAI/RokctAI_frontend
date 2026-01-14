"use server";

import { getClient } from "@/app/lib/client";
import { recordTokenUsage, checkTokenQuota, ACTION_TOKEN_COST } from "@/app/lib/usage";
import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";

export async function createAiTask(data: { name: string; priority?: string; end_date?: string; project?: string; assignee?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) {
        return { success: false, error: "You have reached your limit for today." };
    }

    try {
        const response = await client.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Task",
                    subject: data.name,
                    priority: data.priority || "Medium",
                    exp_end_date: data.end_date,
                    project: data.project,
                    _assign: data.assignee ? JSON.stringify([data.assignee]) : undefined, // Auto-assign if provided
                    status: "Open"
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });

        if (response?.message) {
            if (session) {
                recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            }
            return { success: true, message: response.message };
        }
        return { success: false, error: "No response from backend" };

    } catch (e: any) {
        console.error("Failed to create AI Task", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function createAiNote(data: { title: string; description?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) {
        return { success: false, error: "You have reached your limit for today." };
    }

    try {
        const response = await client.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Note",
                    title: data.title,
                    public: 1
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });

        if (response?.message) {
            if (session) {
                recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            }
            return { success: true, message: response.message };
        }
        return { success: false, error: "No response from backend" };

    } catch (e: any) {
        console.error("Failed to create AI Note", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function createAiProject(data: { name: string; description?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) {
        return { success: false, error: "You have reached your limit for today." };
    }

    try {
        const response = await client.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Project",
                    project_name: data.name,
                    notes: data.description,
                    status: "Open"
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });

        if (response?.message) {
            if (session) {
                recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            }
            return { success: true, message: response.message };
        }
        return { success: false, error: "No response from backend" };

    } catch (e: any) {
        console.error("Failed to create AI Project", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
