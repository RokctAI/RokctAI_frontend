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
