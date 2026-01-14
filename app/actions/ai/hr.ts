"use server";

import { getClient } from "@/app/lib/client";
import { recordTokenUsage, checkTokenQuota, ACTION_TOKEN_COST } from "@/app/lib/usage";
import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";
import { verifyHrRole, getCurrentEmployeeId } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

// --- PERFORMANCE (GOALS) ---

export async function createAiGoal(data: { description: string; start_date?: string; end_date?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) {
        return { success: false, error: "Quota exceeded." };
    }

    try {
        // Fetch current employee
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;

        if (!employee) {
            return { success: false, error: "Employee record not found for your user." };
        }

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Goal",
                    employee: employee,
                    goal: data.description,
                    start_date: data.start_date || new Date().toISOString().split('T')[0],
                    end_date: data.end_date,
                    status: "Open"
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });

        if (response?.message) {
            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: response.message };
        }
        return { success: false, error: "No response from backend" };
    } catch (e: any) {
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function updateAiMyProfile(data: { first_name?: string; last_name?: string; id_number?: string; bank_name?: string; bank_account_no?: string; bank_branch_code?: string; tax_id?: string; modelId?: string }) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Employee not found." };

    const client = await getClient();
    try {
        const response = await (client as any).call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Employee",
                name: employeeId,
                fieldname: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    id_number: data.id_number,
                    bank_name: data.bank_name,
                    bank_account_no: data.bank_account_no,
                    bank_branch_code: data.bank_branch_code,
                    tax_id: data.tax_id
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });
        revalidatePath("/handson/all/hrms/me/employees");
        return { success: true, message: "Profile updated successfully via AI." };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to update profile." };
    }
}

export async function getAiGoals(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    // We default to checking auth for security.
    try {
        // Fetch current employee
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            },
            headers: { 'X-AI-Action': 'true' }
        });
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found" };

        const goals = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Goal",
                filters: { employee: employee },
                fields: ["name", "goal", "status", "progress", "end_date"],
                limit_page_length: 10
            },
            headers: { 'X-AI-Action': 'true' }
        });

        return { success: true, goals: goals?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

// --- LEAVE ---

export async function getLeaveBalance(data: { leave_type?: string; modelId?: string } = {}) {
    // Determine balance.
    const session = await auth();
    const client = await getClient();

    try {
        // Fetch current employee
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found" };

        const allocations = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Leave Allocation",
                filters: { employee: employee, to_date: [">=", new Date().toISOString().split('T')[0]] },
                fields: ["leave_type", "total_leaves_allocated", "new_leaves_allocated"]
            },
            headers: { 'X-AI-Action': 'true' }
        });

        const allocationList = allocations?.message || [];

        // Fetch used leaves to calculate actual balance
        const usedLeaves = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Leave Application",
                filters: {
                    employee: employee,
                    status: "Approved",
                    from_date: [">=", new Date().getFullYear() + "-01-01"]
                },
                fields: ["leave_type", "total_leave_days"]
            },
            headers: { 'X-AI-Action': 'true' }
        });

        const usedMap: Record<string, number> = {};
        if (usedLeaves?.message) {
            for (const leave of usedLeaves.message) {
                usedMap[leave.leave_type] = (usedMap[leave.leave_type] || 0) + leave.total_leave_days;
            }
        }

        const balances = allocationList.map((alloc: any) => ({
            leave_type: alloc.leave_type,
            allocated: alloc.total_leaves_allocated,
            used: usedMap[alloc.leave_type] || 0,
            balance: alloc.total_leaves_allocated - (usedMap[alloc.leave_type] || 0)
        }));

        return { success: true, balances: balances };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

export async function applyAiLeave(data: { leave_type: string; from_date: string; to_date: string; reason?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) {
        return { success: false, error: "Quota exceeded." };
    }

    try {
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found." };

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Leave Application",
                    employee: employee,
                    leave_type: data.leave_type,
                    from_date: data.from_date,
                    to_date: data.to_date,
                    description: data.reason || "Applied via AI Assistant",
                    status: "Open" // Or 'Applied' depending on workflow
                }
            },
            headers: { 'X-AI-Action': 'true' }
        }) as any;

        if (response?.message) {
            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: response.message };
        }
        return { success: false, error: "No response from backend" };

    } catch (e: any) {
        return { success: false, error: e?.message || "Unknown error" };
    }
}

// --- EXPENSES ---

export async function createAiExpenseClaim(data: { description: string; amount: number; currency?: string; attachment_url?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) return { success: false, error: "Quota exceeded." };

    try {
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found." };

        const expenses = [
            {
                expense_type: "Travel", // Defaulting to Travel, can be expanded to accept argument
                amount: data.amount,
                description: data.description,
                sanctioned_amount: data.amount
            }
        ];

        const args: any = {
            doctype: "Expense Claim",
            employee: employee,
            expenses: expenses,
            approval_status: "Draft",
            docstatus: 0
        };

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: { doc: args },
            headers: { 'X-AI-Action': 'true' }
        }) as any;

        if (response?.message) {
            const docName = response.message.name;

            if (data.attachment_url) {
                // Production: Create a File document linked to the Expense Claim
                try {
                    await (client as any).call({
                        method: "frappe.client.insert",
                        args: {
                            doc: {
                                doctype: "File",
                                file_url: data.attachment_url,
                                attached_to_doctype: "Expense Claim",
                                attached_to_name: docName,
                                is_private: 1
                            }
                        },
                        headers: { 'X-AI-Action': 'true' }
                    }) as any;
                } catch (fileError) {
                    // Fallback to remarks
                    console.warn("Failed to attach file", fileError);
                    await (client as any).call({
                        method: "frappe.client.set_value",
                        args: {
                            doctype: "Expense Claim",
                            name: docName,
                            fieldname: "remark",
                            value: `Generated by AI. Attachment: ${data.attachment_url}`
                        }
                    }) as any;
                }
            }

            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: `Expense Claim ${docName} created for ${data.amount}.` };
        }
        return { success: false, error: "No response." };

    } catch (e: any) {
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function getAiExpenses(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    try {
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found" };

        const claims = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Expense Claim",
                filters: { employee: employee },
                fields: ["name", "total_claimed_amount", "approval_status", "remark", "creation"],
                order_by: "creation desc",
                limit_page_length: 5
            }
        });

        return { success: true, claims: claims?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

// --- ATTENDANCE ---

export async function markAiAttendance(data: { log_type?: "IN" | "OUT"; timestamp?: string; latitude?: number; longitude?: number; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) return { success: false, error: "Quota exceeded." };

    try {
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found." };

        // Determine log type if not provided (Toggle based on last log)
        let logType = data.log_type;
        if (!logType) {
            const lastLog = await (client as any).call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Employee Checkin",
                    filters: { employee: employee },
                    fields: ["log_type"],
                    order_by: "time desc",
                    limit_page_length: 1
                }
            });
            const lastType = lastLog?.message?.[0]?.log_type;
            logType = lastType === "IN" ? "OUT" : "IN";
        }

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Employee Checkin",
                    employee: employee,
                    log_type: logType,
                    time: data.timestamp || new Date().toISOString(), // Current time
                    device_id: "AI_Assistant",
                    latitude: data.latitude,
                    longitude: data.longitude
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });

        if (response?.message) {
            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: `Successfully marked attendance: ${logType} at ${new Date().toLocaleTimeString()}` };
        }
        return { success: false, error: "No response." };

    } catch (e: any) {
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function getAttendanceStatus() {
    const session = await auth();
    const client = await getClient();

    try {
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;

        if (!employee) return { status: "Unknown", lastLog: null };

        const lastLog = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Employee Checkin",
                filters: { employee: employee },
                fields: ["log_type", "time"],
                order_by: "time desc",
                limit_page_length: 1
            }
        }) as any;

        const lastType = lastLog?.message?.[0]?.log_type;
        // If last was IN, status is 'Checked In', next action is 'Check Out'
        // If last was OUT, status is 'Checked Out', next action is 'Check In'

        const isCheckedIn = lastType === "IN";
        return {
            success: true,
            status: isCheckedIn ? "Checked In" : "Checked Out",
            nextAction: isCheckedIn ? "Check Out" : "Check In"
        };
    } catch (e) {
        return { success: false, error: "Failed to fetch status" };
    }
}

// --- PAYROLL ---

export async function getAiPayslips(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    try {
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: "name"
            }
        }) as any;
        const employee = employeeRes?.message?.name;
        if (!employee) return { success: false, error: "Employee not found." };

        const payslips = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Salary Slip",
                filters: { employee: employee, docstatus: 1 }, // Only submitted slips
                fields: ["name", "month", "start_date", "end_date", "net_pay", "currency"],
                order_by: "start_date desc",
                limit_page_length: 6
            }
        });

        return { success: true, payslips: payslips?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Unknown error" };
    }
}
// --- ADMIN / APPROVALS ---

export async function getPendingApprovals(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifyHrRole()) return { success: false, error: "Unauthorized: Access Restricted to HR Managers." };

    // Using standard frappe.client.get_list which respects user permissions.
    try {
        // Fetch Open Leave Applications
        const leaveApps = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Leave Application",
                filters: { status: "Open" }, // or "Applied" depending on workflow
                fields: ["name", "employee", "employee_name", "leave_type", "from_date", "to_date", "description", "total_leave_days"],
                limit_page_length: 10
            }
        });

        // Fetch Submitted Expense Claims (docstatus=1 but not yet Approved/Rejected)
        const expenseClaims = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Expense Claim",
                filters: {
                    docstatus: 1,
                    approval_status: "Draft"
                },
                fields: ["name", "employee", "employee_name", "total_claimed_amount", "remark", "posting_date"],
                limit_page_length: 10
            }
        });

        return {
            success: true,
            leaves: leaveApps?.message || [],
            expenses: expenseClaims?.message || []
        };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

export async function processApproval(data: { doctype: "Leave Application" | "Expense Claim" | "Material Request"; name: string; action: "Approve" | "Reject"; comment?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();
    const modelToCharge = data.modelId || AI_MODELS.FREE.id;

    if (!await verifyHrRole()) return { success: false, error: "Unauthorized: Access Restricted to HR Managers." };

    try {
        if (data.doctype === "Leave Application") {
            const status = data.action === "Approve" ? "Approved" : "Rejected";
            await (client as any).call({
                method: "frappe.client.set_value",
                args: {
                    doctype: "Leave Application",
                    name: data.name,
                    fieldname: "status",
                    value: status
                },
                headers: { 'X-AI-Action': 'true' }
            });
            // NOTIFY USER
            const { notifyDecision } = await import("@/app/actions/ai/notifications");
            await notifyDecision("Leave Application", data.name, status as any);

        } else if (data.doctype === "Expense Claim") {
            const status = data.action === "Approve" ? "Approved" : "Rejected";
            await (client as any).call({
                method: "frappe.client.set_value",
                args: {
                    doctype: "Expense Claim",
                    name: data.name,
                    fieldname: "approval_status",
                    value: status
                },
                headers: { 'X-AI-Action': 'true' }
            });
            // NOTIFY USER
            const { notifyDecision } = await import("@/app/actions/ai/notifications");
            await notifyDecision("Expense Claim", data.name, status as any);

        } else if (data.doctype === "Material Request") {
            const status = data.action === "Approve" ? "Approved" : "Rejected";
            await (client as any).call({
                method: "frappe.client.set_value",
                args: {
                    doctype: "Material Request",
                    name: data.name,
                    fieldname: "workflow_state", // Assuming Workflow, or 'status'
                    value: status
                },
                headers: { 'X-AI-Action': 'true' }
            });
            // NOTIFY USER
            const { notifyDecision } = await import("@/app/actions/ai/notifications");
            await notifyDecision("Material Request", data.name, status as any);
        }



        // Removed unreachable code block
    } catch (e: any) {
        console.error("Approval flow failed", e);
        return { success: false, error: e?.message || "Error processing approval" };
    }
}


// --- ANALYTICS ---

export async function getLeaveStats(data: { modelId?: string } = {}) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };

    const session = await auth();
    const client = await getClient();

    try {
        // Fetch All Approved Leaves for this year
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

        const leaves = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Leave Application",
                filters: {
                    status: "Approved",
                    from_date: [">=", startOfYear],
                    to_date: ["<=", endOfYear]
                },
                fields: ["department", "total_leave_days", "leave_type"],
                limit_page_length: 500 // Cap for performance
            }
        });

        const leaveList = leaves?.message || [];

        // Aggregate by Department
        const stats: Record<string, number> = {};

        for (const l of leaveList) {
            const dept = l.department || "No Department";
            stats[dept] = (stats[dept] || 0) + (l.total_leave_days || 0);
        }

        // Format for Recharts
        const chartData = Object.keys(stats).map(dept => ({
            name: dept,
            value: stats[dept]
        })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 Departments

        return { success: true, data: chartData };

    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}



// --- ADMIN / ROLE CHECKS ---

export async function checkHrRole(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    // Check if user has "HR Manager" or "System Manager" role.
    // In Frappe, we check "Has Role" table for user.
    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: { parent: session?.user?.email, role: ["in", ["HR Manager", "System Manager", "HR User"]] },
                fields: ["role"]
            }
        });

        const userRoles = roles?.message || [];
        const hasRole = userRoles.length > 0;
        return { success: true, hasRole: hasRole, roles: userRoles };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

// --- ANNOUNCEMENTS ---

export async function getAnnouncements(data: { modelId?: string } = {}) {
    const client = await getClient();

    // Fetch active announcements
    try {
        const now = new Date().toISOString().split('T')[0];
        const announcements = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Announcement",
                // filters: { 
                //    starts_on: ["<=", now], 
                //    ends_on: [">=", now] // or empty
                // },
                fields: ["name", "subject", "description", "details", "creation"],
                order_by: "creation desc",
                limit_page_length: 3
            }
        });

        return { success: true, announcements: announcements?.message || [] };
    } catch (e: any) {
        return { success: false, announcements: [] };
    }
}

// --- ASSET REQUESTS ---

export async function getAssetItems() {
    const client = await getClient();
    try {
        const response = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Item",
                filters: { is_fixed_asset: 1 },
                fields: ["name", "item_name", "description", "image"],
                limit_page_length: 20
            },
            headers: { 'X-AI-Action': 'true' }
        });
        return response?.message || [];
    } catch (e) {
        return [];
    }
}

export async function createAssetRequest(data: { item_name: string; reason: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) return { success: false, error: "Quota exceeded." };

    try {
        // 1. Get Employee
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: ["name", "company", "department"]
            }
        }) as any;
        const employeeObj = employeeRes?.message;
        if (!employeeObj) return { success: false, error: "Employee record not found." };

        // 2. Resolve Item Code
        // Attempt exact match or fuzzy search on name
        const itemRes = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Item",
                filters: [
                    ["item_name", "like", `%${data.item_name}%`],
                    ["disabled", "=", 0],
                    ["is_fixed_asset", "=", 1] // Prefer fixed assets
                ],
                fields: ["name"],
                limit_page_length: 1
            }
        });

        let itemCode = itemRes?.message?.[0]?.name;

        // Fallback: If no Fixed Asset found, check ANY item
        if (!itemCode) {
            const anyItemRes = await (client as any).call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Item",
                    filters: [
                        ["item_name", "like", `%${data.item_name}%`],
                        ["disabled", "=", 0]
                    ],
                    fields: ["name"],
                    limit_page_length: 1
                }
            });
            itemCode = anyItemRes?.message?.[0]?.name;
        }

        if (!itemCode) {
            return { success: false, error: `Could not find an item matching "${data.item_name}". Please try a more specific name.` };
        }

        // 3. Create Material Request
        const doc = {
            doctype: "Material Request",
            material_request_type: "Material Transfer",
            // Link to Employee if possible, otherwise it's just a request from the user
            // We can put it in remarks
            schedule_date: new Date().toISOString().split('T')[0],
            items: [
                {
                    item_code: itemCode,
                    qty: 1,
                    schedule_date: new Date().toISOString().split('T')[0],
                    description: data.reason
                }
            ],
            remark: `Asset Request for ${employeeObj.name}: ${data.reason}`,
            company: employeeObj.company
        };

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: { doc: doc },
            headers: { 'X-AI-Action': 'true' }
        }) as any;

        if (response?.message) {
            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: `Asset Request created for ${data.item_name} (Ref: ${response.message.name}).` };
        }
        return { success: false, error: "Backend failed into insert request." };

    } catch (e: any) {
        console.error("Asset Request Creation Failed", e);
        return { success: false, error: e?.message || "Error creating asset request." };
    }
}

// --- SALARY ADVANCE ---

export async function createAiEmployeeAdvance(data: { amount: number; purpose: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) return { success: false, error: "Quota exceeded." };

    try {
        // 1. Get Employee
        const employeeRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session?.user?.email },
                fieldname: ["name", "company", "department"]
            }
        }) as any;
        const employeeObj = employeeRes?.message;
        if (!employeeObj) return { success: false, error: "Employee record not found." };

        // 2. Create Employee Advance
        const doc = {
            doctype: "Employee Advance",
            employee: employeeObj.name,
            company: employeeObj.company,
            purpose: data.purpose,
            advance_amount: data.amount,
            repay_unclaimed_amount_from_salary: 1, // Auto-deduct from payroll
            posting_date: new Date().toISOString().split('T')[0],
            status: "Draft" // Pending Approval
        };

        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: { doc: doc },
            headers: { 'X-AI-Action': 'true' }
        }) as any;

        if (response?.message) {
            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: `Salary Advance Request of ${data.amount} created. (Ref: ${response.message.name})` };
        }
        return { success: false, error: "Backend failed to insert request." };

    } catch (e: any) {
        console.error("Employee Advance Creation Failed", e);
        return { success: false, error: e?.message || "Error creating advance request." };
    }
}
