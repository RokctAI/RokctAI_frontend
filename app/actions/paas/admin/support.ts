/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getTickets(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_tickets", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return [];
  }
}

export async function updateTicket(name: string, data: any) {
  try {
    await paasCall("api.admin_records.update_admin_ticket", {
      ticket_name: name,
      ticket_data: data,
    });
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
    return await paasCall("api.admin_records.get_all_reviews", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}

export async function deleteReview(name: string) {
  try {
    await paasCall("api.admin_records.delete_admin_review", {
      review_name: name,
    });
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
    return await paasCall("api.admin_records.get_all_notifications", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
