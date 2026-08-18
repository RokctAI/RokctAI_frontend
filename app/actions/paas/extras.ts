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

// --- Extra Groups ---

export async function getExtraGroups() {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    const groups = await paasCall("api.product_extra.get_extra_groups", {
      shop_id: shop.name,
    });
    return groups;
  } catch (error) {
    console.error("Failed to fetch extra groups:", error);
    return [];
  }
}

export async function createExtraGroup(data: any) {
  try {
    const shop = await paasCall("api.user.get_user_shop");

    const group = await paasCall("api.product_extra.create_extra_group", {
      data: {
        ...data,
        shop: shop.name,
      },
    });
    revalidatePath("/paas/dashboard/products/extras");
    return group;
  } catch (error) {
    console.error("Failed to create extra group:", error);
    throw error;
  }
}

export async function updateExtraGroup(name: string, data: any) {
  try {
    const group = await paasCall("api.product_extra.update_extra_group", {
      name: name,
      data: data,
    });
    revalidatePath("/paas/dashboard/products/extras");
    return group;
  } catch (error) {
    console.error("Failed to update extra group:", error);
    throw error;
  }
}

export async function deleteExtraGroup(name: string) {
  try {
    await paasCall("api.product_extra.delete_extra_group", {
      name: name,
    });
    revalidatePath("/paas/dashboard/products/extras");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete extra group:", error);
    throw error;
  }
}

// --- Extra Values ---

export async function getExtraValues(groupId: string) {
  try {
    const values = await paasCall("api.product_extra.get_extra_values", {
      group_id: groupId,
    });
    return values;
  } catch (error) {
    console.error("Failed to fetch extra values:", error);
    return [];
  }
}

export async function createExtraValue(data: any) {
  try {
    const value = await paasCall("api.product_extra.create_extra_value", {
      data: data,
    });
    revalidatePath("/paas/dashboard/products/extras");
    return value;
  } catch (error) {
    console.error("Failed to create extra value:", error);
    throw error;
  }
}

export async function deleteExtraValue(name: string) {
  try {
    await paasCall("api.product_extra.delete_extra_value", {
      name: name,
    });
    revalidatePath("/paas/dashboard/products/extras");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete extra value:", error);
    throw error;
  }
}
