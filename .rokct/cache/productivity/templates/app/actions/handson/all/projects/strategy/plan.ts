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

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getPlanOnAPage() {
  try {
    const res = await StrategyService.getPlanOnAPage();
    return res;
  } catch (e) {
    return null;
  }
}

export async function updatePlanOnAPage(data: any) {
  try {
    const doc = await StrategyService.updatePlanOnAPage(data);
    revalidatePath("/handson/all/projects/strategy");
    return doc;
  } catch (e) {
    return null;
  }
}
