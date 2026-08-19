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
