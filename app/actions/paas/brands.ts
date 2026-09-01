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
import { revalidatePath } from "next/cache";

export async function getBrands() {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    const brands = await paasCall("api.brand.get_brands", {
      limit_start: 0,
      limit_page_length: 100,
    });

    // Filter brands for current shop
    return brands.filter((b: any) => b.shop === shop.name);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
}

export async function createBrand(data: any) {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    const brand = await paasCall("api.brand.create_brand", {
      brand_data: {
        ...data,
        shop: shop.name,
      },
    });
    revalidatePath("/paas/dashboard/content/brands");
    return brand;
  } catch (error) {
    console.error("Failed to create brand:", error);
    throw error;
  }
}

export async function updateBrand(uuid: string, data: any) {
  try {
    const brand = await paasCall("api.brand.update_brand", {
      uuid: uuid,
      brand_data: data,
    });
    revalidatePath("/paas/dashboard/content/brands");
    return brand;
  } catch (error) {
    console.error("Failed to update brand:", error);
    throw error;
  }
}

export async function deleteBrand(uuid: string) {
  try {
    await paasCall("api.brand.delete_brand", {
      uuid: uuid,
    });
    revalidatePath("/paas/dashboard/content/brands");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete brand:", error);
    throw error;
  }
}
