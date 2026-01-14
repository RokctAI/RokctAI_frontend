"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getTickets(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_tickets",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
        return [];
    }
}

export async function updateTicket(name: string, data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_records.admin_records.update_admin_ticket",
            args: { ticket_name: name, ticket_data: data }
        });
        revalidatePath("/paas/admin/support/tickets");
        return { success: true };
    } catch (error) {
        console.error("Failed to update ticket:", error);
        throw error;
    }
}

export async function getReviews(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_reviews",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    }
}

export async function deleteReview(name: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_records.admin_records.delete_admin_review",
            args: { review_name: name }
        });
        revalidatePath("/paas/admin/support/reviews");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete review:", error);
        throw error;
    }
}

export async function getNotifications(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_notifications",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
}
