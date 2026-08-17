"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getBranches() {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      return [];
    }

    const branches = await paasCall("api.branch.get_branches", {
        shop_id: shop.name,
      });
    return branches;
  } catch (error) {
    console.error("Failed to fetch branches:", error);
    return [];
  }
}

export async function createBranch(data: any) {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    const branch = await paasCall("api.branch.create_branch", {
        branch_data: {
          ...data,
          shop: shop.name,
        },
      });
    revalidatePath("/paas/dashboard/restaurant/branches");
    return branch;
  } catch (error) {
    console.error("Failed to create branch:", error);
    throw error;
  }
}

export async function updateBranch(id: string, data: any) {
  try {
    const branch = await paasCall("api.branch.update_branch", {
        branch_id: id,
        branch_data: data,
      });
    revalidatePath("/paas/dashboard/restaurant/branches");
    return branch;
  } catch (error) {
    console.error("Failed to update branch:", error);
    throw error;
  }
}

export async function deleteBranch(id: string) {
  try {
    await paasCall("api.branch.delete_branch", {
        branch_id: id,
      });
    revalidatePath("/paas/dashboard/restaurant/branches");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete branch:", error);
    throw error;
  }
}
