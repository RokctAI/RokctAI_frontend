import { getSystemControlClient } from "@/app/lib/client";

export interface ProviderTicketData {
    subject: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Urgent";
}

export class SupportService {
    static async getProviderTickets(tenantId: string) {
        const control = await getSystemControlClient();
        try {
            const response = await (control.db() as any).get_list("Issue", {
                filters: { customer: tenantId },
                fields: ["name", "subject", "status", "priority", "creation"],
                order_by: "creation desc"
            });
            return response || [];
        } catch (e) {
            console.error("Failed to fetch provider tickets", e);
            return [];
        }
    }

    static async submitProviderTicket(tenantId: string, data: ProviderTicketData) {
        const control = await getSystemControlClient();
        return (control.db() as any).create_doc("Issue", {
            subject: `[${tenantId}] ${data.subject}`,
            description: data.description,
            priority: data.priority,
            customer: tenantId,
            issue_type: "Technical Support",
            raised_by: "system@tenant.com"
        });
    }
}
