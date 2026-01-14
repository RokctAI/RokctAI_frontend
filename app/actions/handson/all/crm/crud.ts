'use server'

import { getClient } from "@/app/lib/client";
import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

export async function saveDoc(doctype: string, data: any, path_to_revalidate?: string) {
    if (!await verifyCrmRole()) return { error: "Unauthorized" };
    const client = await getClient();

    try {
        let result;
        // Check if updating or creating
        if (data.name) {
            result = await (client as any).call({
                method: "frappe.client.save",
                args: { doc: { doctype, ...data } }
            });
        } else {
            result = await (client as any).call({
                method: "frappe.client.insert",
                args: { doc: { doctype, ...data } }
            });
        }

        if (path_to_revalidate) {
            revalidatePath(path_to_revalidate);
        }

        return { data: result.message };

    } catch (e: any) {
        console.error(`Failed to save ${doctype}`, e);
        // Extracts Frappe error messages if available
        const message = e.message || "Failed to save document";
        return { error: message };
    }
}
