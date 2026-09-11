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

// One legal document, read as a guest (corporate_sdk 1.0.0).
//
// The Next.js counterpart of the Dart corporate_sdk's TermPage /
// PolicyPage data: a "Terms and Conditions" document on the shell's
// backend, read through base_sdk's platform gateway with no credentials
// (the page renders for anonymous visitors, so the doctype is fixed here
// and never handed in from the browser). Soft-fails to `null` with no
// backend, a refused guest read or a failed call - the page then answers
// 404 rather than failing.

import { platformCall } from "@/app/services/base/platform-gateway";
import { LEGAL_DOCTYPE } from "@/components/custom/landing/legal-links";
import {
  normaliseLegalDoc,
  type LegalDoc,
} from "@/components/custom/legal/legal-doc";

/**
 * The document named `name`, or `null` when there is none, the backend
 * cannot be reached, or the row is not a document. A DISABLED document
 * is returned with `disabled: true` so the page can 404 it explicitly.
 */
export async function getPublicTerm(name: string): Promise<LegalDoc | null> {
  const id = name.trim();
  if (!id) return null;
  try {
    const row = await platformCall<unknown>(
      "frappe.client.get",
      { doctype: LEGAL_DOCTYPE, name: id },
      { requireAuth: false },
    );
    return normaliseLegalDoc(row);
  } catch (e) {
    console.error("[legal] term read failed:", e);
    return null;
  }
}
