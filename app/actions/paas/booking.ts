"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

// Reservations

export async function getReservations(status?: string, dateFrom?: string, dateTo?: string) {
    const frappe = await getPaaSClient();

    try {
        // We need to fetch the shop ID first. 
        // Assuming the user is a seller and has a shop.
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        if (!shop) {
            console.error("No shop found for user");
            return [];
        }

        const reservations = await frappe.call({
            method: "paas.api.booking.booking.get_shop_reservations",
            args: {
                shop_id: shop.name,
                status: status,
                date_from: dateFrom,
                date_to: dateTo
            }
        });
        return reservations;
    } catch (error) {
        console.error("Failed to fetch reservations:", error);
        return [];
    }
}

export async function updateReservationStatus(name: string, status: string) {
    const frappe = await getPaaSClient();

    try {
        const reservation = await frappe.call({
            method: "paas.api.booking.booking.update_reservation_status",
            args: {
                name: name,
                status: status
            }
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
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        if (!shop) {
            return [];
        }

        const sections = await frappe.call({
            method: "paas.api.booking.booking.get_shop_sections_for_booking",
            args: {
                shop_id: shop.name
            }
        });
        return sections;
    } catch (error) {
        console.error("Failed to fetch shop sections:", error);
        return [];
    }
}

export async function createShopSection(data: any) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        if (!shop) {
            throw new Error("No shop found");
        }

        const section = await frappe.call({
            method: "paas.api.booking.booking.create_shop_section",
            args: {
                data: {
                    ...data,
                    shop: shop.name,
                    doctype: "Shop Section"
                }
            }
        });
        revalidatePath("/paas/dashboard/booking/tables");
        return section;
    } catch (error) {
        console.error("Failed to create shop section:", error);
        throw error;
    }
}

export async function updateShopSection(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const section = await frappe.call({
            method: "paas.api.booking.booking.update_shop_section",
            args: {
                name: name,
                data: data
            }
        });
        revalidatePath("/paas/dashboard/booking/tables");
        return section;
    } catch (error) {
        console.error("Failed to update shop section:", error);
        throw error;
    }
}

export async function deleteShopSection(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.booking.booking.delete_shop_section",
            args: {
                name: name
            }
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
    const frappe = await getPaaSClient();

    try {
        const tables = await frappe.call({
            method: "paas.api.booking.booking.get_tables_for_section",
            args: {
                shop_section_id: sectionId
            }
        });
        return tables;
    } catch (error) {
        console.error("Failed to fetch tables:", error);
        return [];
    }
}

export async function createTable(data: any) {
    const frappe = await getPaaSClient();

    try {
        const table = await frappe.call({
            method: "paas.api.booking.booking.create_table",
            args: {
                data: {
                    ...data,
                    doctype: "Table",
                    active: 1
                }
            }
        });
        revalidatePath("/paas/dashboard/booking/tables");
        return table;
    } catch (error) {
        console.error("Failed to create table:", error);
        throw error;
    }
}

export async function updateTable(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const table = await frappe.call({
            method: "paas.api.booking.booking.update_table",
            args: {
                name: name,
                data: data
            }
        });
        revalidatePath("/paas/dashboard/booking/tables");
        return table;
    } catch (error) {
        console.error("Failed to update table:", error);
        throw error;
    }
}

export async function deleteTable(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.booking.booking.delete_table",
            args: {
                name: name
            }
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
