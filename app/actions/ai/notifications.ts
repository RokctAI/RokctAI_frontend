"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/auth";

/**
 * Creates a system notification for a specific user.
 * Uses standard Frappe 'Notification Log' doctype.
 */
export async function createNotification(recipientEmail: string, subject: string, message: string, link?: string) {
    const client = await getClient();

    // Find the recipient's User Name (often email)

    try {
        await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Notification Log",
                    subject: subject,
                    for_user: recipientEmail,
                    email_content: message,
                    type: "Alert",
                    document_type: "User", // Generic link
                    document_name: recipientEmail,
                    link: link
                }
            }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to create notification", e);
        // Fallback: Try creating a Note if Notification Log fails (e.g. permission issues)
        try {
            await (client as any).call({
                method: "frappe.client.insert",
                args: {
                    doc: {
                        doctype: "Note",
                        title: subject,
                        public: 0,
                        content: message,
                        // owner: recipientEmail // Only works if we are admin, which we are not always.
                        // Notes are private to creator usually. 
                    }
                }
            });
            return { success: true, note: "Fallback to Note" };
        } catch (ex) {
            return { success: false };
        }
    }
}

export async function notifyDecision(doctype: string, docname: string, status: "Approved" | "Rejected") {
    const client = await getClient();

    try {
        // 1. Fetch the document to find the owner/employee
        const doc = await (client as any).call({
            method: "frappe.client.get",
            args: { doctype, name: docname }
        });

        let recipients: string[] = [];

        if (doctype === "Project") {
            // Fetch Team
            const userList = await (client as any).call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Project User",
                    filters: { parent: docname },
                    fields: ["user"]
                }
            });
            if (userList?.message) {
                recipients = userList.message.map((u: any) => u.user);
            }
            // Also add the owner
            if (doc.message.owner && !recipients.includes(doc.message.owner)) {
                recipients.push(doc.message.owner);
            }

        } else {
            // Default: Owner or Employee
            let recipient = doc.message.owner;
            if (doc.message.employee) {
                const emp = await (client as any).call({
                    method: "frappe.client.get_value",
                    args: { doctype: "Employee", filters: { name: doc.message.employee }, fieldname: "user_id" }
                });
                if (emp?.message?.user_id) {
                    recipient = emp.message.user_id;
                }
            }
            if (recipient) recipients.push(recipient);
        }

        const subject = `${doctype} ${status}`;
        const message = `Your ${doctype} (${docname}) has been ${status}.`;

        // Remove duplicates
        const uniqueRecipients = [...new Set(recipients)];

        for (const user of uniqueRecipients) {
            await createNotification(user, subject, message);
        }

        if (doctype === "Task" && status === "Completed") {
            await notifyDependentTasks(client, docname);
        }

    } catch (e) {
        console.error("notifyDecision failed", e);
    }
}

async function notifyDependentTasks(client: any, completedTaskId: string) {
    // Find tasks that depend on this one
    // We query the Child Table "Task Depends On" to find parents
    try {
        const dependentRows = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Task Depends On",
                filters: { task: completedTaskId },
                fields: ["parent"]
            }
        });

        if (dependentRows?.message) {
            for (const row of dependentRows.message) {
                const dependentTaskId = row.parent;
                // Fetch the task to get the assignee
                const taskInfo = await client.call({
                    method: "frappe.client.get_value",
                    args: {
                        doctype: "Task",
                        filters: { name: dependentTaskId },
                        fieldname: ["subject", "allocated_to", "owner"] // allocated_to is usually the field for assignee
                    }
                });

                if (taskInfo?.message) {
                    const { subject, allocated_to, owner } = taskInfo.message;
                    const recipient = allocated_to || owner; // Prefer assignee, fallback to creator

                    if (recipient) {
                        await createNotification(
                            recipient,
                            "Unblock Alert 🔓", // Emoji for clarity
                            `You are unblocked! Task "${subject}" can now be started since "${completedTaskId}" is complete.`,
                            `/handson/work/task/${dependentTaskId}` // Link to the task (theoretical)
                        );
                    }
                }
            }
        }
    } catch (e) {
        console.error("Failed to notify dependents", e);
    }
}
