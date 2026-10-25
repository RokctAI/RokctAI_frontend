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

import { SystemService } from "@/app/services/all/studio/systems";
import type { DesignSystemDocument } from "@/app/actions/studio/systems/types";

export async function listDesignSystems() {
  try {
    return await SystemService.list();
  } catch (error) {
    console.error("Failed to fetch design systems:", error);
    return [];
  }
}

export async function getDesignSystem(name: string) {
  return SystemService.get(name);
}

export async function deriveDesignSystem(seedColors: string[], name: string, customer?: string) {
  const out = await SystemService.derive(seedColors, name, customer);
  revalidatePath("/studio/systems");
  return out;
}

export async function createDesignSystem(system: DesignSystemDocument, name?: string, customer?: string) {
  const out = await SystemService.create(system, name, customer);
  revalidatePath("/studio/systems");
  return out;
}

export async function updateDesignSystem(
  name: string,
  patch: Partial<DesignSystemDocument>,
  expectedFingerprint?: string,
) {
  const out = await SystemService.update(name, patch, expectedFingerprint);
  revalidatePath("/studio/systems");
  revalidatePath(`/studio/systems/${name}`);
  return out;
}

export async function extractPalette(fileUrl: string, n = 6) {
  return SystemService.extractPalette(fileUrl, n);
}

export async function listFormats() {
  try {
    return await SystemService.formats();
  } catch (error) {
    console.error("Failed to fetch formats:", error);
    return [];
  }
}
