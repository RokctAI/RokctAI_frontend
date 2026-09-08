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

export async function getVisions() {
  try {
    const res = await StrategyService.getVisions();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getVision(name: string) {
  try {
    const res = await StrategyService.getVision(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createVision(data: any) {
  try {
    const res = await StrategyService.createVision(data);
    revalidatePath("/handson/all/projects/strategy");
    return res;
  } catch (e) {
    return null;
  }
}

export async function updateVision(name: string, data: any) {
  try {
    const res = await StrategyService.updateVision(name, data);
    revalidatePath("/handson/all/projects/strategy");
    return res;
  } catch (e) {
    return null;
  }
}

export async function deleteVision(name: string) {
  try {
    await StrategyService.deleteVision(name);
    revalidatePath("/handson/all/projects/strategy");
  } catch (e) {}
}
