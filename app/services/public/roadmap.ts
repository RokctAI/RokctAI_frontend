import { getGuestClient } from "@/app/lib/client";

export class RoadmapPublicService {
    static async getPublicRoadmap() {
        const client = await getGuestClient();
        return (client as any).call("rcore.roadmap.doctype.roadmap_settings.roadmap_settings.get_public_roadmap_content");
    }
}
