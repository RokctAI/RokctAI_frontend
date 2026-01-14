"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getBranches() {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        if (!shop) {
            return [];
        }

        const branches = await frappe.call({
            method: "paas.api.branch.branch.get_branches",
            args: {
                shop_id: shop.name
            }
        });
        return branches;
    } catch (error) {
        console.error("Failed to fetch branches:", error);
        return [];
    }
}

export async function createBranch(data: any) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        const branch = await frappe.call({
            method: "paas.api.branch.branch.create_branch",
            args: {
                branch_data: {
                    ...data,
                    shop: shop.name
                }
            }
        });
        revalidatePath("/paas/dashboard/restaurant/branches");
        return branch;
    } catch (error) {
        console.error("Failed to create branch:", error);
        throw error;
    }
}

export async function updateBranch(id: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const branch = await frappe.call({
            method: "paas.api.branch.branch.update_branch",
            args: {
                branch_id: id,
                branch_data: data
            }
        });
        revalidatePath("/paas/dashboard/restaurant/branches");
        return branch;
    } catch (error) {
        console.error("Failed to update branch:", error);
        throw error;
    }
}

export async function deleteBranch(id: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.branch.branch.delete_branch",
            args: {
                branch_id: id
            }
        });
        revalidatePath("/paas/dashboard/restaurant/branches");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete branch:", error);
        throw error;
    }
}
