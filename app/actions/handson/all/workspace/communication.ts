"use server";

import { getClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";

export interface CommentData {
    name: string;
    content: string;
    sender: string;
    creation: string;
    communication_type?: "Comment" | "Communication" | "Automated Message";
}

export async function getCommunications(doctype: string, docname: string) {
    const client = await getClient();
    try {
        const response = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Communication",
                filters: {
                    reference_doctype: doctype,
                    reference_name: docname
                },
                fields: ["name", "content", "sender", "creation", "communication_type"],
                order_by: "creation asc", // Oldest first for chat-like view
                limit_page_length: 100
            }
        });
        return response?.message || [];
    } catch (e) {
        console.error(`Failed to fetch communications for ${doctype} ${docname}`, e);
        return [];
    }
}

export async function addComment(doctype: string, docname: string, content: string) {
    const client = await getClient();
    try {
        // We use the simpler "frappe.desk.form.utils.add_comment" if available, 
        // or just insert a Communication doc manually. Inserting doc is safer/standard api.

        // Note: 'Comment' DocType is deprecated in newer Frappe versions in favor of 'Communication' 
        // with communication_type='Comment'. Let's try inserting a Communication.

        const user = await (client as any).getLoggedInUser(); // Attempt to get current user email if needed, or let backend handle

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Communication",
                    communication_type: "Comment",
                    communication_medium: "Chat",
                    content: content,
                    reference_doctype: doctype,
                    reference_name: docname,
                    subject: `Comment on ${doctype}: ${docname}`,
                    status: "Open",
                    sent_or_received: "Sent"
                }
            }
        });

        // Revalidate the specific page that uses this data
        // Ideally we would pass the path, but here we cover the main issue path
        revalidatePath(`/handson/all/crm/support/issue/${docname}`);

        return { success: true, message: "Comment added" };
    } catch (e: any) {
        console.error("Failed to add comment", e);
        return { success: false, error: e?.message || "Failed to post comment" };
    }
}
