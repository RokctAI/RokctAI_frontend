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
