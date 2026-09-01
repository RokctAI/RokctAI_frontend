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

import { DeveloperService } from "@/app/services/control/developer";
import { revalidatePath } from "next/cache";

// --- Swagger Settings ---

export async function getSwaggerSettings() {
  return DeveloperService.getSwaggerSettings();
}

export async function generateSwaggerDocumentation() {
  return DeveloperService.generateSwaggerDocumentation();
}

export async function getSwaggerAppRenames() {
  return DeveloperService.getSwaggerAppRenames();
}

export async function deleteSwaggerAppRename(name: string) {
  await DeveloperService.deleteSwaggerAppRename(name);
  revalidatePath("/handson/control/developer");
}

// --- Exclusions ---

export async function getExcludedDoctypes() {
  return DeveloperService.getExcludedDoctypes();
}

export async function deleteExcludedDoctype(name: string) {
  await DeveloperService.deleteExcludedDoctype(name);
  revalidatePath("/handson/control/developer");
}

export async function getExcludedSwaggerModules() {
  return DeveloperService.getExcludedSwaggerModules();
}

export async function deleteExcludedSwaggerModule(name: string) {
  await DeveloperService.deleteExcludedSwaggerModule(name);
  revalidatePath("/handson/control/developer");
}

export async function getExcludedSwaggerDoctypes() {
  return DeveloperService.getExcludedSwaggerDoctypes();
}

export async function deleteExcludedSwaggerDoctype(name: string) {
  await DeveloperService.deleteExcludedSwaggerDoctype(name);
  revalidatePath("/handson/control/developer");
}

// --- Logs & Cache ---

export async function getTenantErrorLogs() {
  return DeveloperService.getTenantErrorLogs();
}

export async function getRawNeurotrophinCache() {
  return DeveloperService.getRawNeurotrophinCache();
}

export async function getRawTenderCache() {
  return DeveloperService.getRawTenderCache();
}
