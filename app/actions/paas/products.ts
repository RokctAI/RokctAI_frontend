/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import { getPaaSClient } from "@/app/lib/client";

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

export async function getProduct(name: string) {
  const frappe = await getPaaSClient();

  try {
    const product = await frappe.call({
      method: "frappe.client.get",
      args: {
        doctype: "Product",
        name: name,
      },
    });
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
