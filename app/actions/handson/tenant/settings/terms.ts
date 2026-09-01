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

import { TermsService } from "@/app/services/tenant/terms";
import type { TenantTerm } from "@/app/services/tenant/terms";
import { revalidatePath } from "next/cache";

/**
 * Fetches "Standard" (Master) terms available for import.
 */
export async function getAvailableMasterTerms() {
  return TermsService.getAvailableMasterTerms();
}

/**
 * Fetches the Tenant's existing terms.
 */
export async function getTenantTerms() {
  return TermsService.getTenantTerms();
}

/**
 * Create a LOCAL copy of a Master Term.
 */
export async function importMasterTerm(masterName: string) {
  // 1. Fetch Master Document
  const masterDoc = await TermsService.getTerm(masterName);

  if (!masterDoc) {
    throw new Error("Master term not found");
  }

  // 2. Create New Document (Copy)
  const newDoc = await TermsService.createTerm({
    title: masterDoc.title, // User can rename later
    terms: masterDoc.terms, // The content
    disabled: 0,
  });

  revalidatePath("/handson/tenant/settings/terms");
  return newDoc;
}

export async function saveTenantTerm(
  name: string | undefined,
  title: string,
  terms: string,
) {
  if (name) {
    await TermsService.updateTerm(name, {
      title: title,
      terms: terms,
    });
  } else {
    await TermsService.createTerm({
      title: title,
      terms: terms,
    });
  }
  revalidatePath("/handson/tenant/settings/terms");
  return { success: true };
}

export async function deleteTenantTerm(name: string) {
  await TermsService.deleteTerm(name);
  revalidatePath("/handson/tenant/settings/terms");
  return { success: true };
}
