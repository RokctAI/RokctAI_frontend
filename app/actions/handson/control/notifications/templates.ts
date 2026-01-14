"use server";

import { NotificationService, NotificationTemplate } from "@/app/services/control/notification_templates";

export type { NotificationTemplate };

/**
 * Fetches all Email Templates from the Control Site.
 */
export async function getMasterTemplates() {
    try {
        const response = await NotificationService.getMasterTemplates();
        return response?.message || [];
    } catch (e) {
        console.error("Failed to fetch Master Templates", e);
        return [];
    }
}

/**
 * Updates a Master Email Template.
 */
export async function saveMasterTemplate(name: string, subject: string, content: string) {
    try {
        const response = await NotificationService.saveMasterTemplate(name, subject, content);
        return response?.message;
    } catch (e) {
        console.error("Failed to save Master Template", e);
        throw e;
    }
}

/**
 * Creates a new Master Email Template if it doesn't exist.
 */
export async function createMasterTemplate(name: string, subject: string, content: string) {
    try {
        const response = await NotificationService.createMasterTemplate(name, subject, content);
        return response?.message;
    } catch (e) {
        console.error("Failed to create Master Template", e);
        throw e;
    }
}
