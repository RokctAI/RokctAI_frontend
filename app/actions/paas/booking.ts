/*
 * Copyright (c) 2026 RokctAI
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
import { getPaaSClient } from "@/app/lib/client";

// Reservations

export async function getReservations(
  status?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  try {
    // We need to fetch the shop ID first.
    // Assuming the user is a seller and has a shop.
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      console.error("No shop found for user");
      return [];
    }

    const reservations = await paasCall("api.booking.get_shop_reservations", {
        shop_id: shop.name,
        status: status,
        date_from: dateFrom,
        date_to: dateTo,
      });
    return reservations;
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return [];
  }
}

export async function updateReservationStatus(name: string, status: string) {
  try {
    const reservation = await paasCall("api.booking.update_reservation_status", {
        name: name,
        status: status,
      });
    revalidatePath("/paas/dashboard/booking/reservations");
    return reservation;
  } catch (error) {
    console.error("Failed to update reservation status:", error);
    throw error;
  }
}

// Shop Sections (Zones)

export async function getShopSections() {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      return [];
    }

    const sections = await paasCall("api.booking.get_shop_sections_for_booking", {
        shop_id: shop.name,
      });
    return sections;
  } catch (error) {
    console.error("Failed to fetch shop sections:", error);
    return [];
  }
}

export async function createShopSection(data: any) {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      throw new Error("No shop found");
    }

    const section = await paasCall("api.booking.create_shop_section", {
        data: {
          ...data,
          shop: shop.name,
          doctype: "Shop Section",
        },
      });
    revalidatePath("/paas/dashboard/booking/tables");
    return section;
  } catch (error) {
    console.error("Failed to create shop section:", error);
    throw error;
  }
}

export async function updateShopSection(name: string, data: any) {
  try {
    const section = await paasCall("api.booking.update_shop_section", {
        name: name,
        data: data,
      });
    revalidatePath("/paas/dashboard/booking/tables");
    return section;
  } catch (error) {
    console.error("Failed to update shop section:", error);
    throw error;
  }
}

export async function deleteShopSection(name: string) {
  try {
    await paasCall("api.booking.delete_shop_section", {
        name: name,
      });
    revalidatePath("/paas/dashboard/booking/tables");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete shop section:", error);
    throw error;
  }
}

// Tables

export async function getTables(sectionId: string) {
  try {
    const tables = await paasCall("api.booking.get_tables_for_section", {
        shop_section_id: sectionId,
      });
    return tables;
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return [];
  }
}

export async function createTable(data: any) {
  try {
    const table = await paasCall("api.booking.create_table", {
        data: {
          ...data,
          doctype: "Table",
          active: 1,
        },
      });
    revalidatePath("/paas/dashboard/booking/tables");
    return table;
  } catch (error) {
    console.error("Failed to create table:", error);
    throw error;
  }
}

export async function updateTable(name: string, data: any) {
  try {
    const table = await paasCall("api.booking.update_table", {
        name: name,
        data: data,
      });
    revalidatePath("/paas/dashboard/booking/tables");
    return table;
  } catch (error) {
    console.error("Failed to update table:", error);
    throw error;
  }
}

export async function deleteTable(name: string) {
  try {
    await paasCall("api.booking.delete_table", {
        name: name,
      });
    revalidatePath("/paas/dashboard/booking/tables");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete table:", error);
    throw error;
  }
}

export async function getReservation(name: string) {
  const frappe = await getPaaSClient();

  try {
    const reservation = await frappe.db().getDoc("User Booking", name);
    return reservation;
  } catch (error) {
    console.error("Failed to fetch reservation:", error);
    return null;
  }
}
