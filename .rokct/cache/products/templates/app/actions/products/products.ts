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

import { paasCall } from "@/app/services/base/platform-gateway";
import { revalidatePath } from "next/cache";

export async function getProducts(page: number = 1, perPage: number = 20) {
  try {
    const start = (page - 1) * perPage;
    const products = await paasCall("api.seller_product.get_seller_products", {
      limit_start: start,
      limit_page_length: perPage,
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getProduct(name: string): Promise<any> {
  try {
    // Registered in commerce/merchants/frappe manifest `whitelisted_methods`;
    // the method returns `{ data: <Product doc as dict> }` (empty `data` when
    // the product does not exist).
    const result = await paasCall("api.seller_product.get_product_details", {
      product_name: name,
    });
    const product = result?.data;
    if (!product || Object.keys(product).length === 0) {
      return null;
    }
    return product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function createProduct(data: any) {
  try {
    const product = await paasCall("api.seller_product.create_seller_product", {
      product_data: data,
    });
    return product;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
}

export async function updateProduct(name: string, data: any) {
  try {
    const product = await paasCall("api.seller_product.update_seller_product", {
      product_name: name,
      product_data: data,
    });
    return product;
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
}

export async function deleteProduct(name: string) {
  try {
    await paasCall("api.seller_product.delete_seller_product", {
      product_name: name,
    });
    return true;
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
}

export async function getInventory(itemCode: string) {
  try {
    return await paasCall("api.seller_operations.get_seller_inventory_items", {
      item_code: itemCode,
    });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return [];
  }
}

export async function adjustInventory(
  itemCode: string,
  warehouse: string,
  newQty: number,
) {
  try {
    await paasCall("api.seller_operations.adjust_seller_inventory", {
      item_code: itemCode,
      warehouse: warehouse,
      new_qty: newQty,
    });
    revalidatePath(`/dashboard/products/${itemCode}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to adjust inventory:", error);
    throw error;
  }
}
