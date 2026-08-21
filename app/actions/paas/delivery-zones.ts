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
