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

export async function getWorkingHours() {
  try {
    const hours = await paasCall(
      "api.seller_shop_settings.get_seller_shop_working_days",
    );
    return hours;
  } catch (error) {
    console.error("Failed to fetch working hours:", error);
    return [];
  }
}

export async function updateWorkingHours(data: any) {
  try {
    const result = await paasCall(
      "api.seller_shop_settings.update_seller_shop_working_days",
      {
        working_days_data: data,
      },
    );
    return result;
  } catch (error) {
    console.error("Failed to update working hours:", error);
    throw error;
  }
}
