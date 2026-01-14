"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getRoadmaps() {
    const client = await getPaaSClient();
    const roadmaps = await (client.db() as any).get_list("Roadmap", {
        fields: ["name", "title", "description", "status", "github_status"],
        filters: { status: "Active" },
        order_by: "creation desc"
    });
    return roadmaps;
}

export async function getRoadmapFeatures(roadmapName: string) {
    const client = await getPaaSClient();
    const features = await (client.db() as any).get_list("Roadmap Feature", {
        fields: ["name", "feature", "description", "status", "priority", "roadmap"],
        filters: { roadmap: roadmapName },
        order_by: "creation desc"
    });
    return features;
}
