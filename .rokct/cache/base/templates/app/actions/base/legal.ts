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

// The legal documents a shell publishes, read as a guest (base_sdk 1.37.0).
//
// Server-side on purpose, like app/actions/base/status.ts: the list
// renders for anonymous visitors (a footer's Legal row, corporate_sdk's
// /legal index), so the doctype and the fields are fixed here rather than
// handed in from the browser. The pages themselves are corporate_sdk's;
// this is the read every shell shares.

import { platformCall } from "@/app/services/base/platform-gateway";
import {
  LEGAL_DOCTYPE,
  normalisePublicTerms,
  type PublicTerm,
} from "@/components/custom/landing/legal-links";

/**
 * Every ENABLED "Terms and Conditions" document, `{name, title,
 * disabled}` each, through the platform gateway as a guest (no
 * credentials) - the same soft-failing shape as `getLandingPlans`: empty
 * when the gateway has no base URL (a shell with no backend), when the
 * backend refuses the guest read, or when the call fails. A footer or an
 * index page then lists nothing rather than the page failing.
 */
export async function listPublicTerms(): Promise<PublicTerm[]> {
  try {
    const rows = await platformCall<unknown>(
      "frappe.client.get_list",
      {
        doctype: LEGAL_DOCTYPE,
        fields: ["name", "title", "disabled"],
        filters: { disabled: 0 },
        order_by: "title asc",
        limit_page_length: 100,
      },
      { requireAuth: false },
    );
    return normalisePublicTerms(rows);
  } catch (e) {
    console.error("[legal] terms list failed:", e);
    return [];
  }
}
