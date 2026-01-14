import { getSystemControlClient } from "@/app/lib/client";

export interface Announcement {
    name?: string;
    title: string;
    content: string;
    target_plans: string[];
    is_active: boolean;
    creation?: string;
}

const CATEGORY = "SaaS Announcement";

export class AnnouncementService {
    static async getGlobalAnnouncements(): Promise<Announcement[]> {
        const frappe = await getSystemControlClient();
        const items = await (frappe.db() as any).get_list("SaaS Configuration Item", {
            filters: { category: CATEGORY },
            fields: ["name", "label", "description", "is_active", "creation", "region"],
            limit: 100
        });

        return items.map((item: any) => {
            try {
                const data = JSON.parse(item.description);
                data.name = item.name;
                data.creation = item.creation;
                return data;
            } catch (e) {
                return null;
            }
        }).filter((a: any) => a !== null);
    }
}
