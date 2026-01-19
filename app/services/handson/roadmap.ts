import { HandsonBaseService } from "./base";

export class RoadmapService {
    static async getRoadmaps() {
        return HandsonBaseService.getList("Roadmap", {
            fields: ["name", "title", "description", "status", "github_status", "source_repository", "jules_api_key", "require_jules_approval"],
            order_by: "creation desc"
        });
    }

    static async getRoadmap(name: string) {
        return HandsonBaseService.getDoc("Roadmap", name);
    }

    static async getRoadmapFeatures(roadmapName: string) {
        return HandsonBaseService.getList("Roadmap Feature", {
            fields: ["name", "feature", "description", "status", "priority", "roadmap", "jules_session_id", "ai_status", "pull_request_url"],
            filters: { roadmap: roadmapName },
            order_by: "creation desc"
        });
    }

    static async createRoadmap(data: any) {
        return HandsonBaseService.insert({ doctype: "Roadmap", ...data });
    }

    static async updateRoadmap(name: string, data: any) {
        return HandsonBaseService.update("Roadmap", name, data);
    }

    static async deleteRoadmap(name: string) {
        return HandsonBaseService.delete("Roadmap", name);
    }

    static async createRoadmapFeature(data: any) {
        return HandsonBaseService.insert({ doctype: "Roadmap Feature", ...data });
    }

    static async updateRoadmapFeature(name: string, data: any) {
        return HandsonBaseService.update("Roadmap Feature", name, data);
    }

    static async deleteRoadmapFeature(name: string) {
        return HandsonBaseService.delete("Roadmap Feature", name);
    }

    static async assignToJules(docname: string, feature: string, explanation: string) {
        return HandsonBaseService.call("rcore.roadmap.doctype.roadmap_feature.roadmap_feature.assign_to_jules", {
            docname,
            feature,
            explanation
        });
    }

    static async getJulesSources(apiKey?: string) {
        return HandsonBaseService.call("brain.api.get_jules_sources", { api_key: apiKey });
    }

    static async triggerJules() {
        return HandsonBaseService.call("rcore.roadmap.tasks.trigger_daily_generation");
    }

    static async setPublicRoadmap(roadmapName: string | null) {
        // We update the Singleton 'Roadmap Settings'
        // If roadmapName is null, we clear it (making nothing public)
        return HandsonBaseService.update("Roadmap Settings", "Roadmap Settings", {
            public_roadmap: roadmapName
        });
    }

    static async getGlobalSettings() {
        return HandsonBaseService.getDoc("Roadmap Settings", "Roadmap Settings");
    }
}
