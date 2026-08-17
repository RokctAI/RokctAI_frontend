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
