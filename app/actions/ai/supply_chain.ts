"use server";

import { recordTokenUsage, ACTION_TOKEN_COST } from "@/app/lib/usage";
import { getClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";
import { verifySupplyChainRole } from "@/app/lib/roles";
import { createPurchaseOrder } from "@/app/actions/handson/all/accounting/buying/order";
import { createStockReconciliation } from "@/app/actions/handson/all/accounting/inventory/stock";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";
import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";

// --- QUOTATIONS (SALES/SELLING) ---

export async function getActiveQuotations(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifySupplyChainRole()) return { success: false, error: "Unauthorized" };

    try {
        const quotations = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Quotation",
                filters: {
                    status: ["in", ["Open", "Replied"]],
                    docstatus: 1
                },
                fields: ["name", "party_name", "customer_name", "status", "grand_total", "transaction_date", "valid_till"],
                order_by: "transaction_date desc",
                limit_page_length: 10
            }
        });

        return { success: true, quotations: quotations?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch quotations" };
    }
}

// --- PROCUREMENT (BUYING) ---

export async function getPurchaseOrders(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifySupplyChainRole()) return { success: false, error: "Unauthorized" };

    try {
        const orders = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Purchase Order",
                filters: {
                    status: ["not in", ["Closed", "Completed", "Cancelled"]],
                    docstatus: 1
                },
                fields: ["name", "supplier", "grand_total", "status", "transaction_date"],
                order_by: "transaction_date desc",
                limit_page_length: 10
            }
        });

        return { success: true, orders: orders?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch purchase orders" };
    }
}

export async function createAiPurchaseOrder(data: { supplier: string, items: { item: string, qty: number }[] }) {
    if (!await verifySupplyChainRole()) return { success: false, error: "Unauthorized" };

    const { findFuzzyMatch } = await import("@/app/lib/search");

    // 0. Resolve Supplier
    const supplierSearch = await findFuzzyMatch("Supplier", data.supplier);

    if (!supplierSearch.success) {
        return { success: false, error: supplierSearch.error };
    }

    const finalSupplier = supplierSearch.value;

    const client = await getClient();
    try {
        const processedItems = await Promise.all(data.items.map(async (line) => {
            // Also attempt Fuzzy Match for Items?
            // For now, let's keep the existing logic (Item Name Like query) or genericize later.
            // The existing logic searches by Item Name "like".


            const itemDetails = await (client as any).call({
                method: "frappe.client.get_value",
                args: { doctype: "Item", filters: { item_name: ["like", line.item] }, fieldname: ["name", "standard_rate"] }
            }) as any;

            const itemCode = itemDetails?.message?.name || line.item; // Fallback to input
            const rate = itemDetails?.message?.standard_rate || 0;

            return {
                item_code: itemCode,
                qty: line.qty,
                rate: rate
            };
        }));

        const result = await createPurchaseOrder({
            supplier: finalSupplier,
            transaction_date: new Date().toISOString().split('T')[0],
            items: processedItems
        });

        const session = await auth();
        if (session) {
            recordTokenUsage(session, ACTION_TOKEN_COST, AI_MODELS.FREE.id);
        }

        if (result.success && result.message) {
            const { notifyDecision } = await import("@/app/actions/ai/notifications");
            await notifyDecision("Purchase Order", result.message, "Created" as any);
        }

        return result;
    } catch (e) {
        return { success: false, error: "Failed to create Order" };
    }
}

// --- INVENTORY (STOCK) ---

export async function checkStock(data: { itemQuery: string }) {
    if (!await verifySupplyChainRole()) return { success: false, error: "Unauthorized" };

    const client = await getClient();
    try {
        // 1. Search for Item
        const items = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Item",
                filters: {
                    item_name: ["like", `%${data.itemQuery}%`],
                    disabled: 0
                },
                fields: ["name", "item_name", "stock_uom", "standard_rate"],
                limit_page_length: 5
            }
        }) as any;

        if (!items?.message || items.message.length === 0) {
            return { success: false, message: `No items found matching "${data.itemQuery}"` };
        }

        // 2. For each item, get Stock Levels
        const stockDetails = await Promise.all(items.message.map(async (item: any) => {
            const bins = await (client as any).call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Bin",
                    filters: { item_code: item.name },
                    fields: ["warehouse", "actual_qty", "projected_qty"]
                }
            }) as any;

            return {
                ...item,
                stock: bins?.message || []
            };
        }));

        const session = await auth();
        if (session) {
            recordTokenUsage(session, ACTION_TOKEN_COST, AI_MODELS.FREE.id);
        }
        return { success: true, data: stockDetails };

    } catch (e) {
        return { success: false, error: "Failed to check stock" };
    }
}

export async function createAiStockEntry(data: { source_warehouse: string, target_warehouse: string, items: { item: string, qty: number }[] }) {
    if (!await verifySupplyChainRole()) return { success: false, error: "Unauthorized" };

    // Using Frappe's Stock Entry
    const client = await getClient();
    try {
        const processedItems = await Promise.all(data.items.map(async (line) => {
            // Validate/Get Item Code logic same as above
            const itemDetails = await (client as any).call({
                method: "frappe.client.get_value",
                args: { doctype: "Item", filters: { item_name: ["like", line.item] }, fieldname: ["name", "stock_uom"] }
            }) as any;
            const itemCode = itemDetails?.message?.name || line.item;

            return {
                item_code: itemCode,
                qty: line.qty,
                uom: itemDetails?.message?.stock_uom || "Nos",
                s_warehouse: data.source_warehouse,
                t_warehouse: data.target_warehouse
            };
        }));

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Stock Entry",
                    stock_entry_type: "Material Transfer",
                    to_warehouse: data.target_warehouse,
                    from_warehouse: data.source_warehouse,
                    items: processedItems
                }
            }
        }) as any;

        const session = await auth();
        if (session) {
            recordTokenUsage(session, ACTION_TOKEN_COST, AI_MODELS.FREE.id);
        }
        revalidatePath("/handson/all/supply-chain");

        return { success: true, message: response?.message?.name };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed" };
    }
}
