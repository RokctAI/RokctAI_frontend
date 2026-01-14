"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getDeliveryZones() {
    const frappe = await getPaaSClient();

    try {
        const zones = await frappe.call({
            method: "paas.api.seller_delivery_zone.seller_delivery_zone.get_seller_delivery_zones",
        });
        return zones;
    } catch (error) {
        console.error("Failed to fetch delivery zones:", error);
        return [];
    }
}

export async function createDeliveryZone(data: any) {
    const frappe = await getPaaSClient();

    try {
        const zone = await frappe.call({
            method: "paas.api.seller_delivery_zone.seller_delivery_zone.create_seller_delivery_zone",
            args: {
                zone_data: data
            }
        });
        return zone;
    } catch (error) {
        console.error("Failed to create delivery zone:", error);
        throw error;
    }
}

export async function deleteDeliveryZone(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_delivery_zone.seller_delivery_zone.delete_seller_delivery_zone",
            args: {
                zone_name: name
            }
        });
        return true;
    } catch (error) {
        console.error("Failed to delete delivery zone:", error);
        throw error;
    }
}

export async function checkDeliveryFee(lat: number, lng: number) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.api.seller_delivery_zone.seller_delivery_zone.check_delivery_fee",
            args: {
                lat: lat,
                lng: lng
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to check delivery fee:", error);
        return { fee: null, message: "Failed to calculate fee" };
    }
}
