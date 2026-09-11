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

export type UserRole = "Employee" | "Client" | "Accountant" | "Viewer";

/**
 * Every call in this file goes through the ONE platform gateway (ADR-005,
 * a `{cmd, payload}` POST), never a per-method URL. They had to move:
 * `FrappeApp.call()` takes ZERO arguments and returns a `FrappeCall`
 * (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so every
 * `(client as any).call({ method, args })` here discarded its argument,
 * issued no HTTP request, and handed back an SDK builder object. Reading
 * `.message` off it gave `undefined`, so the user list was always empty
 * and creating a user always "succeeded" without creating anything. The
 * `as any` is what let it compile.
 *
 * `frappe.client.*` is the framework form the gateway takes verbatim (see
 * app/lib/gateway-rpc.ts), and `throwOnError` keeps the axios semantics
 * these try/catch blocks were written against.
 */
export async function getUsers() {
  try {
    const response = await platformCall<any[]>(
      "frappe.client.get_list",
      {
        doctype: "User",
        fields: [
          "name",
          "first_name",
          "last_name",
          "email",
          "enabled",
          "role_profile_name",
        ],
        filters: [["name", "not in", ["Administrator", "Guest"]]], // Hide system users
        limit_page_length: 50,
      },
      { throwOnError: true },
    );
    return response || [];
  } catch (e) {
    console.error("Failed to fetch Users", e);
    return [];
  }
}

export async function createUser(data: {
  email: string;
  first_name: string;
  last_name?: string;
  role: UserRole;
}) {
  try {
    // 1. Create the User Document
    const userRes = await platformCall<Record<string, any>>(
      "frappe.client.insert",
      {
        doc: {
          doctype: "User",
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          enabled: 1,
          send_welcome_email: 1, // Optional: Send login instructions
          roles: [], // Explicitly set empty roles initially
        },
      },
      { throwOnError: true },
    );

    // 2. Assign Roles based on Selection
    // We add roles to the User's 'roles' child table
    const rolesToAdd: string[] = [];

    if (data.role === "Employee") {
      rolesToAdd.push("System User", "Employee", "Blogger"); // Standard access
    } else if (data.role === "Client") {
      rolesToAdd.push("Website User", "Customer"); // Portal access only
    } else if (data.role === "Accountant") {
      rolesToAdd.push("System User", "Accounts Manager", "Accounts User"); // Finance access
    } else if (data.role === "Viewer") {
      // Explicitly assign the 'Viewer' role defined in role.json fixture
      rolesToAdd.push("System User", "Viewer");
    }

    // Apply roles
    if (rolesToAdd.length > 0) {
      // We need to re-save with the roles list.
      // Ideally use 'frappe.client.set_value' or 'add_role' API if available.
      // But 'frappe.client.get' + 'save' with roles child table works reliably.

      // Construct Role child table objects
      const rolesTable = rolesToAdd.map((r) => ({ role: r }));

      // Re-update user with roles
      await platformCall(
        "frappe.client.set_value",
        {
          doctype: "User",
          name: data.email,
          fieldname: {
            roles: rolesTable,
          },
        },
        { throwOnError: true },
      );
    }

    // `platformCall` already unwrapped Frappe's `message` envelope, so
    // `userRes` is the inserted doc the old `.message` read meant to reach.
    return { success: true, message: userRes };
  } catch (e: any) {
    console.error("Failed to create User", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
