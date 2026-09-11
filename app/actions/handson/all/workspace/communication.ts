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

import { platformCall } from "@/app/services/base/platform-gateway";
import { revalidatePath } from "next/cache";

export interface CommentData {
  name: string;
  content: string;
  sender: string;
  creation: string;
  communication_type?: "Comment" | "Communication" | "Automated Message";
}

/**
 * Rides the ONE platform gateway (ADR-005, a `{cmd, payload}` POST), never
 * a per-method URL. `frappe.client.*` is the framework form the gateway
 * takes verbatim (app/lib/gateway-rpc.ts).
 *
 * It had to move: `FrappeApp.call()` takes ZERO arguments and returns a
 * `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so the
 * `{method, args}` object was discarded, no HTTP request was issued, and
 * the caller got an SDK builder back. `throwOnError` keeps the axios
 * semantics the try/catch here was written against.
 */
export async function getCommunications(doctype: string, docname: string) {
  try {
    const response = await platformCall<CommentData[]>(
      "frappe.client.get_list",
      {
        doctype: "Communication",
        filters: {
          reference_doctype: doctype,
          reference_name: docname,
        },
        fields: ["name", "content", "sender", "creation", "communication_type"],
        order_by: "creation asc", // Oldest first for chat-like view
        limit_page_length: 100,
      },
      { throwOnError: true },
    );
    return response || [];
  } catch (e) {
    console.error(
      `Failed to fetch communications for ${doctype} ${docname}`,
      e,
    );
    return [];
  }
}

export async function addComment(
  doctype: string,
  docname: string,
  content: string,
) {
  try {
    // We use the simpler "frappe.desk.form.utils.add_comment" if available,
    // or just insert a Communication doc manually. Inserting doc is safer/standard api.

    // Note: 'Comment' DocType is deprecated in newer Frappe versions in favor of 'Communication'
    // with communication_type='Comment'. Let's try inserting a Communication.

    // The `(client as any).getLoggedInUser()` that stood here went with the
    // client: `FrappeApp` has no such method (it lives on `.auth()`), so the
    // line could only ever throw into the catch below. Its result was never
    // read — the backend stamps the sender — so nothing replaces it.
    await platformCall(
      "frappe.client.insert",
      {
        doc: {
          doctype: "Communication",
          communication_type: "Comment",
          communication_medium: "Chat",
          content: content,
          reference_doctype: doctype,
          reference_name: docname,
          subject: `Comment on ${doctype}: ${docname}`,
          status: "Open",
          sent_or_received: "Sent",
        },
      },
      { throwOnError: true },
    );

    // Revalidate the specific page that uses this data
    // Ideally we would pass the path, but here we cover the main issue path
    revalidatePath(`/handson/all/crm/support/issue/${docname}`);

    return { success: true, message: "Comment added" };
  } catch (e: any) {
    console.error("Failed to add comment", e);
    return { success: false, error: e?.message || "Failed to post comment" };
  }
}
