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

import { revalidatePath } from "next/cache";

import { HotFolderService } from "@/app/services/all/studio/hot-folder";

export async function getHotFolderStatus() {
  return HotFolderService.status();
}

export async function saveHotFolderSettings(values: Record<string, unknown>) {
  const out = await HotFolderService.save(values);
  revalidatePath("/studio/settings/hot-folder");
  return out;
}

export async function runHotFolder() {
  const out = await HotFolderService.run();
  revalidatePath("/studio/settings/hot-folder");
  return out;
}
