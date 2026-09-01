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

import { GlobalSettingsService } from "@/app/services/control/global_settings";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  return GlobalSettingsService.getGlobalSettings();
}

export async function toggleBetaMode() {
  const result = await GlobalSettingsService.toggleBetaMode();
  if (result.success) {
    revalidatePath("/");
  }
  return result;
}

export async function toggleDebugMode() {
  const result = await GlobalSettingsService.toggleDebugMode();
  if (result.success) {
    revalidatePath("/");
  }
  return result;
}
