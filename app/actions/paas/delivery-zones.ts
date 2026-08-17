"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getDeliveryZones() {
  try {
    const zones = await paasCall("api.seller_delivery_zone.get_seller_delivery_zones");
    return zones;
  } catch (error) {
    console.error("Failed to fetch delivery zones:", error);
    return [];
  }
}

export async function createDeliveryZone(data: any) {
  try {
    const zone = await paasCall("api.seller_delivery_zone.create_seller_delivery_zone", {
        zone_data: data,
      });
    return zone;
  } catch (error) {
    console.error("Failed to create delivery zone:", error);
    throw error;
  }
}

export async function deleteDeliveryZone(name: string) {
  try {
    await paasCall("api.seller_delivery_zone.delete_seller_delivery_zone", {
        zone_name: name,
      });
    return true;
  } catch (error) {
    console.error("Failed to delete delivery zone:", error);
    throw error;
  }
}

export async function checkDeliveryFee(lat: number, lng: number) {
  try {
    const result = await paasCall("api.seller_delivery_zone.check_delivery_fee", {
        lat: lat,
        lng: lng,
      });
    return result;
  } catch (error) {
    console.error("Failed to check delivery fee:", error);
    return { fee: null, message: "Failed to calculate fee" };
  }
}
