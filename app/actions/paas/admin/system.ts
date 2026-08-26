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

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getLanguages() {
  try {
    // limit_page_length 0 = no limit, so admins see every seeded language.
    return await paasCall("api.admin_settings.get_all_languages", {
      limit_page_length: 0,
    });
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return [];
  }
}

export async function updateLanguage(
  languageName: string,
  languageData: Record<string, unknown>,
) {
  try {
    await paasCall("api.admin_settings.update_language", {
      language_name: languageName,
      language_data: languageData,
    });
    revalidatePath("/paas/admin/system/languages");
    return { success: true };
  } catch (error) {
    console.error("Failed to update language:", error);
    throw error;
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

export interface TranslationRow {
  id: string;
  group: string;
  locale: string;
  value: string;
  status: number;
}

export interface TranslationsPage {
  total: number;
  perPage: number;
  translations: Record<string, TranslationRow[]>;
}

/**
 * Drops empty/whitespace-only locale values. An empty PaaS Translation row
 * suppresses the app's fallback and renders blank, so blanks are omitted
 * rather than persisted.
 */
function pruneEmptyValues(values: Record<string, string>) {
  const pruned: Record<string, string> = {};
  for (const [locale, text] of Object.entries(values)) {
    if (typeof text === "string" && text.trim() !== "") {
      pruned[locale] = text;
    }
  }
  return pruned;
}

export async function getTranslations(params?: {
  search?: string;
  group?: string;
  locale?: string;
  page?: number;
  perPage?: number;
}): Promise<TranslationsPage> {
  const perPage = params?.perPage ?? 20;
  const empty: TranslationsPage = { total: 0, perPage, translations: {} };
  try {
    const res = await paasCall("api.translation.get_translations_paginate", {
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.group ? { group: params.group } : {}),
      ...(params?.locale ? { locale: params.locale } : {}),
      page: params?.page ?? 1,
      perPage,
    });
    return (res as any)?.data ?? empty;
  } catch (error) {
    console.error("Failed to fetch translations:", error);
    return empty;
  }
}

export async function createTranslation(
  group: string,
  key: string,
  values: Record<string, string>,
) {
  const value = pruneEmptyValues(values);
  if (Object.keys(value).length === 0) {
    // The backend upserts by delete-then-insert; an empty dict would
    // silently wipe the key. Require at least one non-empty value.
    throw new Error("At least one non-empty translation value is required");
  }
  try {
    await paasCall("api.translation.create_translation", {
      group,
      key,
      value,
    });
    revalidatePath("/paas/admin/system/translations");
    return { success: true };
  } catch (error) {
    console.error("Failed to create translation:", error);
    throw error;
  }
}

export async function updateTranslation(
  key: string,
  group: string,
  values: Record<string, string>,
) {
  const value = pruneEmptyValues(values);
  if (Object.keys(value).length === 0) {
    // Same guard as createTranslation: never send an empty dict.
    throw new Error("At least one non-empty translation value is required");
  }
  try {
    await paasCall("api.translation.update_translation", {
      key,
      group,
      value,
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
