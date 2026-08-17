"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getGalleryImages() {
  try {
    const images = await paasCall("api.seller_shop_gallery.get_seller_shop_galleries");
    return images;
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return [];
  }
}

export async function addGalleryImage(data: any) {
  try {
    const image = await paasCall("api.seller_shop_gallery.create_seller_shop_gallery", {
        gallery_data: data,
      });
    revalidatePath("/paas/dashboard/settings/gallery");
    return image;
  } catch (error) {
    console.error("Failed to add gallery image:", error);
    throw error;
  }
}

export async function deleteGalleryImage(name: string) {
  try {
    await paasCall("api.seller_shop_gallery.delete_seller_shop_gallery", {
        gallery_name: name,
      });
    revalidatePath("/paas/dashboard/settings/gallery");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    throw error;
  }
}
