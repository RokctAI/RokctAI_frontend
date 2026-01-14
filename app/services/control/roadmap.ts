import { ControlBaseService } from "./base";

export class RoadmapService {
    static async getRoadmaps() {
        return ControlBaseService.getList("Roadmap", {
            fields: ["name", "title", "description", "status", "github_status", "source_repository"],
            order_by: "creation desc"
        });
    }

    static async getRoadmapFeatures(roadmapName: string) {
        return ControlBaseService.getList("Roadmap Feature", {
            fields: ["name", "feature", "description", "status", "priority", "roadmap", "jules_session_id"],
            filters: { roadmap: roadmapName },
            order_by: "creation desc"
        });
    }

    static async createRoadmap(data: any) {
        return ControlBaseService.insert({ doctype: "Roadmap", ...data });
    }

    static async updateRoadmap(name: string, data: any) {
        return ControlBaseService.update("Roadmap", name, data);
    }

    static async deleteRoadmap(name: string) {
        return ControlBaseService.delete("Roadmap", name);
    }

    static async createRoadmapFeature(data: any) {
        return ControlBaseService.insert({ doctype: "Roadmap Feature", ...data });
    }

    static async updateRoadmapFeature(name: string, data: any) {
        return ControlBaseService.update("Roadmap Feature", name, data);
    }

    static async deleteRoadmapFeature(name: string) {
        return ControlBaseService.delete("Roadmap Feature", name);
    }
}
