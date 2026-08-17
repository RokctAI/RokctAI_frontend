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
