"use server";

import { getClient } from "@/app/lib/client";
import { getDepartments } from "@/app/actions/handson/all/hrms/departments";
import { auth } from "@/auth";

export interface HolidayWorkInput {
    holiday: string; // Name of the holiday
    audience: "Me Only" | "All" | "Departments";
    departments?: string[]; // Array of department names
}

export async function checkUpcomingHoliday() {
    const client = await getClient();
    const session = await auth();
    try {
        // Find the next holiday after today
        const today = new Date().toISOString().split('T')[0];
        const response = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Holiday",
                filters: [["holiday_date", ">", today]],
                fields: ["name", "description", "holiday_date"],
                limit_page_length: 1,
                order_by: "holiday_date asc"
            }
        });

        if (response?.message?.length > 0) {
            const holiday = response.message[0];
            const holidayTitle = holiday.description || "Holiday";

            // Check if user has already responded (Global Check)
            if (session?.user?.email) {
                // 1. Check for Personal Note
                const note = await (client as any).call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "Note",
                        filters: [
                            ["title", "like", `%Working on ${holidayTitle}%`],
                            ["owner", "=", session.user.email]
                        ],
                        limit_page_length: 1
                    }
                });

                // 2. Check for Announcement
                const announcement = await (client as any).call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "Announcement",
                        filters: [
                            ["subject", "like", `%${holidayTitle}%`],
                            ["owner", "=", session.user.email]
                        ],
                        limit_page_length: 1
                    }
                });

                if ((note?.message && note.message.length > 0) || (announcement?.message && announcement.message.length > 0)) {
                    // Already handled on another device
                    return { found: false, message: "Already responded." };
                }
            }

            return { found: true, holiday: holiday };
        }
        return { found: false, message: "No upcoming holidays found." };
    } catch (e: any) {
        console.error("Failed to check holidays", e);
        return { found: false, error: e?.message || "Error checking holidays" };
    }
}

export async function announceHolidayWork({ holiday, audience, departments }: HolidayWorkInput) {
    const client = await getClient();
    const session = await auth();
    const user = session?.user?.name || "Manager";

    try {
        if (audience === "Me Only") {
            // Log a Note for the user
            await (client as any).call({
                method: "frappe.client.insert",
                args: {
                    doc: {
                        doctype: "Note",
                        title: `Working on ${holiday}`,
                        public: 0,
                        content: `I will be working on the holiday: ${holiday}.`
                    }
                }
            });
            return { success: true, message: "Logged your working day in Notes." };

        } else if (audience === "All") {
            // Create a Global Announcement
            await (client as any).call({
                method: "frappe.client.insert",
                args: {
                    doc: {
                        doctype: "Announcement",
                        subject: `Working Day: ${holiday}`,
                        content: `Dear Team,<br>Please note that we will be operational on ${holiday}.`,
                        owner: session?.user?.email,
                        status: "Active"
                    }
                }
            });
            return { success: true, message: "Sent global announcement to all employees." };

        } else if (audience === "Departments" && departments?.length) {
            // Targeted Notification
            // 1. Fetch Users in these Departments
            // This is complex in standard API, we'll simulate by creating a targeted Announcement 
            // OR iteration. For MVP efficiency, we'll create an Announcement with the Dept names in the subject/body
            // and assume users filter manually or we tag them. 
            // Better: We send an announcement that explicitly mentions the departments.

            const deptString = departments.join(", ");
            await (client as any).call({
                method: "frappe.client.insert",
                args: {
                    doc: {
                        doctype: "Announcement",
                        subject: `Working Day for ${deptString}`,
                        content: `Attention ${deptString} teams,<br>You are scheduled to work on ${holiday}.`,
                        status: "Active"
                    }
                }
            });
            return { success: true, message: `Sent announcement targeted at: ${deptString}.` };
        }

        return { success: false, message: "Invalid audience selection." };

    } catch (e: any) {
        console.error("Failed to announce holiday work", e);
        return { success: false, error: e?.message || "Action failed" };
    }
}
