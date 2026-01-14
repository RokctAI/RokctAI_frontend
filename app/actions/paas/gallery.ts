"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getGalleryImages() {
    const frappe = await getPaaSClient();

    try {
        const images = await frappe.call({
            method: "paas.api.seller_shop_gallery.seller_shop_gallery.get_seller_shop_galleries"
        });
        return images;
    } catch (error) {
        console.error("Failed to fetch gallery images:", error);
        return [];
    }
}

export async function addGalleryImage(data: any) {
    const frappe = await getPaaSClient();

    try {
        const image = await frappe.call({
            method: "paas.api.seller_shop_gallery.seller_shop_gallery.create_seller_shop_gallery",
            args: {
                gallery_data: data
            }
        });
        revalidatePath("/paas/dashboard/settings/gallery");
        return image;
    } catch (error) {
        console.error("Failed to add gallery image:", error);
        throw error;
    }
}

export async function deleteGalleryImage(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_shop_gallery.seller_shop_gallery.delete_seller_shop_gallery",
            args: {
                gallery_name: name
            }
        });
        revalidatePath("/paas/dashboard/settings/gallery");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete gallery image:", error);
        throw error;
    }
}
