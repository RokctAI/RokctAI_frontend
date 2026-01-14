"use server";

import { getClient } from "@/app/lib/client";

export type UserRole = "Employee" | "Client" | "Accountant" | "Viewer";

export async function getUsers() {
    const client = await getClient();
    try {
        const response = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "User",
                fields: ["name", "first_name", "last_name", "email", "enabled", "role_profile_name"],
                filters: [["name", "not in", ["Administrator", "Guest"]]], // Hide system users
                limit_page_length: 50
            }
        });
        return response?.message || [];
    } catch (e) {
        console.error("Failed to fetch Users", e);
        return [];
    }
}

export async function createUser(data: { email: string; first_name: string; last_name?: string; role: UserRole }) {
    const client = await getClient();
    try {
        // 1. Create the User Document
        const userRes = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "User",
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    enabled: 1,
                    send_welcome_email: 1, // Optional: Send login instructions
                    roles: [] // Explicitly set empty roles initially
                }
            }
        });

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
            const user = userRes.message;
            // We need to re-save with the roles list.
            // Ideally use 'frappe.client.set_value' or 'add_role' API if available.
            // But 'frappe.client.get' + 'save' with roles child table works reliably.

            // Construct Role child table objects
            const rolesTable = rolesToAdd.map(r => ({ role: r }));

            // Re-update user with roles
            await (client as any).call({
                method: "frappe.client.set_value",
                args: {
                    doctype: "User",
                    name: data.email,
                    fieldname: {
                        roles: rolesTable
                    }
                }
            });
        }

        return { success: true, message: userRes.message };
    } catch (e: any) {
        console.error("Failed to create User", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
