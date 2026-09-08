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

export async function getPersonalMasteryGoals() {
  try {
    const res = await StrategyService.getPersonalMasteryGoals();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createPersonalMasteryGoal(data: any) {
  try {
    const res = await StrategyService.createPersonalMasteryGoal(data);
    revalidatePath("/handson/all/projects/strategy");
    return res;
  } catch (e) {
    return null;
  }
}

export async function updatePersonalMasteryGoal(name: string, data: any) {
  try {
    const res = await StrategyService.updatePersonalMasteryGoal(name, data);
    revalidatePath("/handson/all/projects/strategy");
    return res;
  } catch (e) {
    return null;
  }
}

export async function deletePersonalMasteryGoal(name: string) {
  try {
    await StrategyService.deletePersonalMasteryGoal(name);
    revalidatePath("/handson/all/projects/strategy");
  } catch (e) {}
}
