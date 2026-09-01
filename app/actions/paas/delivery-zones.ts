/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getDeliveryZones() {
  try {
    const zones = await paasCall(
      "api.seller_delivery_zone.get_seller_delivery_zones",
    );
    return zones;
  } catch (error) {
    console.error("Failed to fetch delivery zones:", error);
    return [];
  }
}

export async function createDeliveryZone(data: any) {
  try {
    const zone = await paasCall(
      "api.seller_delivery_zone.create_seller_delivery_zone",
      {
        zone_data: data,
      },
    );
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
    const result = await paasCall(
      "api.seller_delivery_zone.check_delivery_fee",
      {
        lat: lat,
        lng: lng,
      },
    );
    return result;
  } catch (error) {
    console.error("Failed to check delivery fee:", error);
    return { fee: null, message: "Failed to calculate fee" };
  }
}
