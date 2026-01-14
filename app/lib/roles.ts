"use server";

import { auth } from "@/auth";
import { getClient } from "@/app/lib/client";

/**
 * Gets the Employee record name (ID) for the currently logged-in user.
 * Returns null if not found.
 */
export async function getCurrentEmployeeId() {
    const session = await auth();
    if (!session?.user?.email) return null;

    const client = await getClient();
    try {
        const response = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session.user.email },
                fieldname: "name"
            }
        });
        return response?.message?.name || null;
    } catch (e) {
        return null;
    }
}

import {
    HR_ROLES,
    CRM_ROLES,
    SUPPLY_CHAIN_ROLES,
    FINANCE_ROLES,
    LENDING_ROLES,
    LMS_ROLES
} from "@/app/lib/role_constants";

// --- Role Constants (Re-exported for backward compat if needed, but better to import directly) ---
// Actually, strict separation is better. We import them here for use in the functions below.


/**
 * Checks if the current user is an Active employee (Not Resigning/Left).
 * Returns TRUE if Active, FALSE if Resigning/Left.
 */
export async function verifyActiveEmployee() {
    const session = await auth();
    const client = await getClient();
    if (!session?.user?.email) return false;

    try {
        // 1. Get Employee ID
        const empRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Employee",
                filters: { user_id: session.user.email },
                fieldname: "name"
            }
        });
        const employee = empRes?.message?.name;
        if (!employee) return true; // If no employee record, they might be admin/system user, so allow (or handle elsewhere)

        // 2. Check for Pending/Approved Separation (Resignation)
        const separation = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Employee Separation",
                filters: {
                    employee: employee,
                    status: ["in", ["Pending", "Approved", "Submitted"]] // Check exact status values
                },
                limit_page_length: 1
            }
        });

        if (separation?.message?.length > 0) {
            // Resignation Process in Update 
            return false;
        }

        return true;

    } catch (e: any) {
        // Core HRMS logic: If "Employee Separation" isn't found, it's an unexpected state but we shouldn't block access.
        if (e?.message?.includes("doctype") || e?.exc_type === "DoesNotExistError") {
            return true;
        }
        console.warn("verifyActiveEmployee failed, defaulting to active:", e);
        return true;
    }
}

/**
 * Verifies if the current user has HR Manager or System Manager role.
 * Returns true if authorized, false otherwise.
 * Usage: if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
 */
export async function verifyHrRole() {
    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    // Note: Resigning employees RETAIN access to HR modules (for "Me Mode" access like Payslips)
    // If we wanted to restrict Admin HR actions specifically, we would need a separate check.
    // For now, we allow access.

    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["in", HR_ROLES]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        return roles?.message && roles.message.length > 0;
    } catch (e) {
        console.error("Role check failed", e);
        return false;
    }
}

/**
 * Verifies if the current user has CRM/Sales Manager or System Manager role.
 * Returns true if authorized, false otherwise.
 */
export async function verifyCrmRole() {
    // SECURITY: Resigning employees lose access to Business Critical Roles
    if (!await verifyActiveEmployee()) return false;

    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["in", CRM_ROLES]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        return roles?.message && roles.message.length > 0;
    } catch (e) {
        return false;
    }
}

/**
 * Verifies if the current user has Stock Manager, Purchase Manager, or System Manager role.
 */
export async function verifySupplyChainRole() {
    // SECURITY: Resigning employees lose access to Business Critical Roles
    if (!await verifyActiveEmployee()) return false;

    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["in", SUPPLY_CHAIN_ROLES]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        return roles?.message && roles.message.length > 0;
    } catch (e) {
        console.error("Supply Chain Role check failed", e);
        return false;
    }
}

/**
 * Verifies if the current user has Accounts Manager, Accounts User, or System Manager role.
 */
export async function verifyFinanceRole() {
    // SECURITY: Resigning employees lose access to Financials
    if (!await verifyActiveEmployee()) return false;

    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["in", FINANCE_ROLES]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        return roles?.message && roles.message.length > 0;
    } catch (e) {
        return false;
    }
}

/**
 * Verifies if the current user is a System Manager.
 */
export async function verifySystemManager() {
    // SECURITY: Resigning employees lose access to Admin
    if (!await verifyActiveEmployee()) return false;

    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["=", "System Manager"]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        return roles?.message && roles.message.length > 0;
    } catch (e) {
        return false;
    }
}

/**
 * Verifies if the current user has Lending Manager, Loan User, or System Manager role.
 */
/**
 * Verifies if the user's company has a valid Lending License.
 * Returns true if licensed, false otherwise.
 */
export async function verifyLendingLicense() {
    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    // Strict Session Check:
    // If we have a company context (even if license is undefined/null), we trust it.
    // If company context is missing entirely, we fail safe.
    const companyContext = (session.user as any)?.company;

    // If company exists but has no license -> Return false.
    // If company exists and has license -> Return true.
    return !!(companyContext?.license);
}

/**
 * Verifies if the current user has Lending Manager, Loan User, or System Manager role.
 * COMBINES both Role Check AND License Check.
 */
export async function verifyLendingRole() {
    // SECURITY: Resigning employees lose access to Business Critical Roles
    if (!await verifyActiveEmployee()) return false;

    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    try {
        // 1. Check User Roles
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["in", LENDING_ROLES]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        if (!roles?.message || roles.message.length === 0) return false;

        return await verifyLendingLicense();

    } catch (e) {
        return false;
    }
}

/**
 * Returns detailed license status for UI feedback.
 */
/**
 * Returns detailed license and compliance status, including basic company info for reports.
 */
export async function getLendingLicenseDetails() {
    const session = await auth();

    if (!session?.user?.email) return { isLicensed: false, country: null };

    // Strict Session Check:
    // We rely mostly on session data now.
    const companyContext = (session.user as any)?.company;

    // If we have context, use it. 
    // If not, we could fallback (legacy), but we want to enforce session usage.
    // However, specifically for 'compliance' calculation logic, we use the session data.

    if (companyContext) {
        const license = companyContext.license;
        const country = companyContext.country;
        const yearEndDateStr = companyContext.yearEndDate; // YYYY-MM-DD
        const officialName = companyContext.companyName || companyContext.name;
        const taxId = companyContext.taxId;

        let complianceStatus = {
            deadline: null as Date | null,
            daysRemaining: null as number | null,
            isDueSoon: false,
            isOverdue: false
        };

        if (yearEndDateStr) {
            const yearEnd = new Date(yearEndDateStr);
            // Deadline is 6 months after year end
            const deadline = new Date(yearEnd);
            deadline.setMonth(deadline.getMonth() + 6);

            const today = new Date();
            const diffTime = deadline.getTime() - today.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            complianceStatus = {
                deadline,
                daysRemaining,
                isDueSoon: daysRemaining > 0 && daysRemaining <= 60, // Warn 2 months out
                isOverdue: daysRemaining < 0
            };
        }

        return {
            isLicensed: !!(license && license.trim() !== ""),
            country: country || "South Africa",
            licenseNumber: license,
            financialYearEnd: yearEndDateStr,
            companyName: officialName,
            compliance: complianceStatus,
            taxId: taxId || null
        };
    }

    return { isLicensed: false, country: null, error: "No Company Context in Session" };
}

/**
 * Verifies if the current user has LMS Student, Instructor, or System Manager role.
 */
export async function verifyLmsRole() {
    const session = await auth();
    const client = await getClient();

    if (!session?.user?.email) return false;

    try {
        const roles = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Has Role",
                filters: {
                    parent: session.user.email,
                    role: ["in", LMS_ROLES]
                },
                fields: ["role"],
                limit_page_length: 1
            }
        }) as any;

        return roles?.message && roles.message.length > 0;
    } catch (e) {
        return false;
    }
}
