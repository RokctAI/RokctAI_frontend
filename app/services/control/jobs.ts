import { getSystemControlClient } from "@/app/lib/client";

export class JobsService {
    static async getOpenings() {
        const frappe = await getSystemControlClient(); // Revert to Admin identity, easier to fix permissions for Admin than Guest
        return (frappe as any).db().getDocList("Job Opening", {
            fields: ["name", "job_title", "status", "department", "location", "description"],
            filters: { status: "Open" },
            limit: 20
        });
    }
}
