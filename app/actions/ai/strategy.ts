"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { frappeRpc } from "@/app/lib/frappe-rpc";
// Goals/Strategy often acceptable for all employees or constrained to managers?
// Access via Employee record usually.

export async function getMyOkrs(data: { modelId?: string } = {}) {
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return { success: false, error: "Access Restricted" };

  const session = await auth();
  const client = await getClient();

  try {
    // Get Employee
    const employeeRes = (await frappeRpc(client, "frappe.client.get_value", {
        doctype: "Employee",
        filters: { user_id: session?.user?.email },
        fieldname: "name",
      })) as any;
    const employee = employeeRes?.message?.name;
    if (!employee) return { success: false, error: "Employee not found." };

    const goals = await frappeRpc(client, "frappe.client.get_list", {
        doctype: "Goal",
        filters: { employee: employee, status: "Open" },
        fields: ["name", "goal", "progress", "end_date"],
        limit_page_length: 5,
      });

    return { success: true, goals: goals?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
