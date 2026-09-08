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

import { getClient } from "@/app/lib/client";
import { verifyCrmRole } from "@/app/lib/roles";

export interface DocField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  read_only?: number;
}

export interface DocTypeMeta {
  name: string;
  fields: DocField[];
}

export async function getDocTypeMeta(
  doctype: string,
): Promise<{ data?: DocTypeMeta; error?: string }> {
  if (!(await verifyCrmRole())) return { error: "Unauthorized" };
  const client = await getClient();

  try {
    const meta = await (client as any).call({
      method: "frappe.client.get_meta",
      args: { doctype },
    });

    // Simplified meta for frontend consumption
    const fields = meta.message.fields.map((f: any) => ({
      fieldname: f.fieldname,
      label: f.label,
      fieldtype: f.fieldtype,
      reqd: f.reqd,
      options: f.options,
      hidden: f.hidden,
      read_only: f.read_only,
    }));

    return {
      data: {
        name: meta.message.name,
        fields: fields,
      },
    };
  } catch (e) {
    console.error(`Failed to fetch Meta for ${doctype}`, e);
    return { error: "Failed to fetch Metadata" };
  }
}
