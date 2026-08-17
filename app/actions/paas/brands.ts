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
