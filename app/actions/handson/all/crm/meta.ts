'use server'

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

export async function getDocTypeMeta(doctype: string): Promise<{ data?: DocTypeMeta, error?: string }> {
    if (!await verifyCrmRole()) return { error: "Unauthorized" };
    const client = await getClient();

    try {
        const meta = await (client as any).call({
            method: "frappe.client.get_meta",
            args: { doctype }
        });

        // Simplified meta for frontend consumption
        const fields = meta.message.fields.map((f: any) => ({
            fieldname: f.fieldname,
            label: f.label,
            fieldtype: f.fieldtype,
            reqd: f.reqd,
            options: f.options,
            hidden: f.hidden,
            read_only: f.read_only
        }));

        return {
            data: {
                name: meta.message.name,
                fields: fields
            }
        };

    } catch (e) {
        console.error(`Failed to fetch Meta for ${doctype}`, e);
        return { error: "Failed to fetch Metadata" };
    }
}
