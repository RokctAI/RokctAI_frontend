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
