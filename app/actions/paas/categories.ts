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

export async function getCategories() {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      return [];
    }

    const categories = await paasCall("api.category.get_categories", {
      shop_id: shop.name,
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(data: any) {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    const category = await paasCall("api.category.create_category", {
      category_data: {
        ...data,
        shop: shop.name,
      },
    });
    revalidatePath("/paas/dashboard/products/categories");
    return category;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    const category = await paasCall("api.category.update_category", {
      category_id: id,
      category_data: data,
    });
    revalidatePath("/paas/dashboard/products/categories");
    return category;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    await paasCall("api.category.delete_category", {
      category_id: id,
    });
    revalidatePath("/paas/dashboard/products/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
}
