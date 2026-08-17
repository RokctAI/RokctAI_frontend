"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";


export async function getTickets(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_tickets", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return [];
  }
}

export async function updateTicket(name: string, data: any) {
  try {
    await paasCall("api.admin_records.update_admin_ticket", { ticket_name: name, ticket_data: data });
    revalidatePath("/paas/admin/support/tickets");
    return { success: true };
  } catch (error) {
    console.error("Failed to update ticket:", error);
    throw error;
  }
}

export async function getReviews(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_reviews", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}

export async function deleteReview(name: string) {
  try {
    await paasCall("api.admin_records.delete_admin_review", { review_name: name });
    revalidatePath("/paas/admin/support/reviews");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete review:", error);
    throw error;
  }
}

export async function getNotifications(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_notifications", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
