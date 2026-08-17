"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getLanguages() {
  try {
    return await paasCall("api.admin_settings.get_all_languages");
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return [];
  }
}

export async function getBackups() {
  try {
    return await paasCall("api.admin_system.get_backups");
  } catch (error) {
    console.error("Failed to fetch backups:", error);
    return [];
  }
}

export async function createBackup() {
  try {
    await paasCall("api.admin_system.create_backup");
    revalidatePath("/paas/admin/system/backup");
    return { success: true };
  } catch (error) {
    console.error("Failed to create backup:", error);
    throw error;
  }
}

export async function getSystemInfo() {
  try {
    const [infoRes, versionRes] = await Promise.allSettled([
      paasCall("api.admin_system.get_system_info"),
      paasCall("api.get_version"),
    ]);

    const info =
      infoRes.status === "fulfilled"
        ? (infoRes.value as any).message || infoRes.value
        : {};
    const version =
      versionRes.status === "fulfilled"
        ? (versionRes.value as any).message || versionRes.value
        : null;

    return {
      ...info,
      version: version,
    };
  } catch (error) {
    console.error("Failed to fetch system info:", error);
    return {};
  }
}

export async function clearCache() {
  try {
    await paasCall("api.admin_system.clear_system_cache");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear cache:", error);
    throw error;
  }
}

export async function getTranslations() {
  const frappe = await getPaaSClient();
  try {
    return await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "PaaS Translation",
        fields: ["name", "locale", "group", "key", "value", "status"],
        limit_page_length: 1000,
      },
    });
  } catch (error) {
    console.error("Failed to fetch translations:", error);
    return [];
  }
}

export async function updateTranslation(name: string, value: string) {
  const frappe = await getPaaSClient();
  try {
    await frappe.call({
      method: "frappe.client.set_value",
      args: {
        doctype: "PaaS Translation",
        name: name,
        fieldname: "value",
        value: value,
      },
    });
    revalidatePath("/paas/admin/system/translations");
    return { success: true };
  } catch (error) {
    console.error("Failed to update translation:", error);
    throw error;
  }
}

export async function triggerSystemUpdate() {
  try {
    return await paasCall("api.system.trigger_system_update");
  } catch (error) {
    console.error("Failed to trigger system update:", error);
    throw error;
  }
}
