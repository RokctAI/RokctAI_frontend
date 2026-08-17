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

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { gatewayCall } from "@/app/lib/gateway-rpc";

/**
 * Creates a system notification for a specific user.
 * Uses standard Frappe 'Notification Log' doctype.
 */
export async function createNotification(
  recipientEmail: string,
  subject: string,
  message: string,
  link?: string,
) {
  const client = await getClient();

  // Find the recipient's User Name (often email)

  try {
    await gatewayCall(client, "frappe.client.insert", {
        doc: {
          doctype: "Notification Log",
          subject: subject,
          for_user: recipientEmail,
          email_content: message,
          type: "Alert",
          document_type: "User", // Generic link
          document_name: recipientEmail,
          link: link,
        },
      });
    return { success: true };
  } catch (e) {
    console.error("Failed to create notification", e);
    // Fallback: Try creating a Note if Notification Log fails (e.g. permission issues)
    try {
      await gatewayCall(client, "frappe.client.insert", {
          doc: {
            doctype: "Note",
            title: subject,
            public: 0,
            content: message,
            // owner: recipientEmail // Only works if we are admin, which we are not always.
            // Notes are private to creator usually.
          },
        });
      return { success: true, note: "Fallback to Note" };
    } catch (ex) {
      return { success: false };
    }
  }
}

export async function notifyDecision(
  doctype: string,
  docname: string,
  status: "Approved" | "Rejected",
) {
  const client = await getClient();

  try {
    // 1. Fetch the document to find the owner/employee
    const doc = await gatewayCall(client, "frappe.client.get", { doctype, name: docname });

    let recipients: string[] = [];

    if (doctype === "Project") {
      // Fetch Team
      const userList = await gatewayCall(client, "frappe.client.get_list", {
          doctype: "Project User",
          filters: { parent: docname },
          fields: ["user"],
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
        const emp = await gatewayCall(client, "frappe.client.get_value", {
            doctype: "Employee",
            filters: { name: doc.message.employee },
            fieldname: "user_id",
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
    const dependentRows = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Task Depends On",
        filters: { task: completedTaskId },
        fields: ["parent"],
      });

    if (dependentRows?.message) {
      for (const row of dependentRows.message) {
        const dependentTaskId = row.parent;
        // Fetch the task to get the assignee
        const taskInfo = await gatewayCall(client, "frappe.client.get_value", {
            doctype: "Task",
            filters: { name: dependentTaskId },
            fieldname: ["subject", "allocated_to", "owner"], // allocated_to is usually the field for assignee
          });

        if (taskInfo?.message) {
          const { subject, allocated_to, owner } = taskInfo.message;
          const recipient = allocated_to || owner; // Prefer assignee, fallback to creator

          if (recipient) {
            await createNotification(
              recipient,
              "Unblock Alert 🔓", // Emoji for clarity
              `You are unblocked! Task "${subject}" can now be started since "${completedTaskId}" is complete.`,
              `/handson/work/task/${dependentTaskId}`, // Link to the task (theoretical)
            );
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to notify dependents", e);
  }
}
