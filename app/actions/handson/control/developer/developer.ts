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
