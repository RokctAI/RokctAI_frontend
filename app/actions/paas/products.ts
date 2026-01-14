"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getProducts(page: number = 1, perPage: number = 20) {
    const frappe = await getPaaSClient();

    try {
        const start = (page - 1) * perPage;
        const products = await frappe.call({
            method: "paas.api.seller_product.seller_product.get_seller_products",
            args: {
                limit_start: start,
                limit_page_length: perPage
            }
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
                name: name
            }
        });
        return product;
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}

export async function createProduct(data: any) {
    const frappe = await getPaaSClient();

    try {
        const product = await frappe.call({
            method: "paas.api.seller_product.seller_product.create_seller_product",
            args: {
                product_data: data
            }
        });
        return product;
    } catch (error) {
        console.error("Failed to create product:", error);
        throw error;
    }
}

export async function updateProduct(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const product = await frappe.call({
            method: "paas.api.seller_product.seller_product.update_seller_product",
            args: {
                product_name: name,
                product_data: data
            }
        });
        return product;
    } catch (error) {
        console.error("Failed to update product:", error);
        throw error;
    }
}

export async function deleteProduct(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_product.seller_product.delete_seller_product",
            args: {
                product_name: name
            }
        });
        return true;
    } catch (error) {
        console.error("Failed to delete product:", error);
        throw error;
    }
}

export async function getInventory(itemCode: string) {
    try {
        const frappe = await getPaaSClient();
        return await frappe.call({
            method: "paas.api.seller_operations.seller_operations.get_seller_inventory_items",
            args: { item_code: itemCode }
        });
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return [];
    }
}

export async function adjustInventory(itemCode: string, warehouse: string, newQty: number) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_operations.seller_operations.adjust_seller_inventory",
            args: { item_code: itemCode, warehouse: warehouse, new_qty: newQty }
        });
        revalidatePath(`/dashboard/products/${itemCode}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to adjust inventory:", error);
        throw error;
    }
}
