import { HandsonBaseService } from "./base";
import { platformCall } from "@/app/services/base/platform-gateway";

/**
 * The platform/control site that hosts the brain functions. Brain calls go
 * through the universal gateway (`rokct.platform.api`) on this host with a
 * `{cmd, payload}` envelope — never via direct dotted brain method paths
 * (per ruling; same host the release workflow's `brain_endpoint` targets).
 */
const PLATFORM_HOST = "https://platform.rokct.ai";

/**
 * Executes a brain function through the universal platform gateway.
 * `cmd` is the dotted method minus the `rcore.` prefix (e.g.
 * `api.brain.get_jules_status`). Returns the function's own result with
 * the Frappe `message` envelope already unwrapped (platformCall handles
 * that), or `null` on failure — matching how callers already consume
 * these results (`res || []` etc.).
 */
function brainCall<T = any>(cmd: string, payload: Record<string, unknown>) {
  return platformCall<T>(cmd, payload, { baseUrl: PLATFORM_HOST });
}

export class RoadmapService {
  static async getRoadmaps() {
    return HandsonBaseService.getList("Roadmap", {
      fields: [
        "name",
        "title",
        "description",
        "status",
        "github_status",
        "source_repository",
        "jules_api_key",
        "require_jules_approval",
      ],
      order_by: "creation desc",
    });
  }

  static async getRoadmap(name: string) {
    return HandsonBaseService.getDoc("Roadmap", name);
  }

  static async getRoadmapFeatures(roadmapName: string) {
    return HandsonBaseService.getList("Roadmap Feature", {
      fields: [
        "name",
        "feature",
        "description",
        "status",
        "priority",
        "roadmap",
        "jules_session_id",
        "ai_status",
        "pull_request_url",
      ],
      filters: { roadmap: roadmapName },
      order_by: "creation desc",
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

  static async assignToJules(
    docname: string,
    feature: string,
    explanation: string,
  ) {
    return HandsonBaseService.call(
      "rcore.roadmap.doctype.roadmap_feature.roadmap_feature.assign_to_jules",
      {
        docname,
        feature,
        explanation,
      },
    );
  }

  static async getJulesSources(apiKey?: string) {
    return brainCall("api.brain.get_jules_sources", {
      api_key: apiKey,
    });
  }

  static async triggerJules() {
    return HandsonBaseService.call(
      "rcore.roadmap.tasks.trigger_daily_generation",
    );
  }

  static async discoverContext(name: string) {
    return await HandsonBaseService.call(
      "rcore.roadmap.tasks.discover_roadmap_context",
      { roadmap_name: name },
    );
  }

  static async generateIdeas(name: string) {
    return await HandsonBaseService.call("rcore.roadmap.tasks.generate_ideas", {
      roadmap_name: name,
    });
  }

  static async setPublicRoadmap(roadmapName: string | null) {
    // We update the Singleton 'Roadmap Settings'
    // If roadmapName is null, we clear it (making nothing public)
    return HandsonBaseService.update("Roadmap Settings", "Roadmap Settings", {
      public_roadmap: roadmapName,
    });
  }

  static async getGlobalSettings() {
    return HandsonBaseService.getDoc("Roadmap Settings", "Roadmap Settings");
  }

  // --- Interactive Jules ---

  static async getJulesStatus(sessionId: string, apiKey?: string) {
    return brainCall("api.brain.get_jules_status", {
      session_id: sessionId,
      api_key: apiKey,
    });
  }

  static async getJulesActivities(sessionId: string, apiKey?: string) {
    return brainCall("api.brain.get_jules_activities", {
      session_id: sessionId,
      api_key: apiKey,
    });
  }

  static async voteOnPlan(
    sessionId: string,
    action: "approve",
    apiKey?: string,
  ) {
    return brainCall("api.brain.vote_on_plan", {
      session_id: sessionId,
      action: action,
      api_key: apiKey,
    });
  }

  static async sendJulesMessage(
    sessionId: string,
    message: string,
    apiKey?: string,
  ) {
    return brainCall("api.brain.send_jules_message", {
      session_id: sessionId,
      message: message,
      api_key: apiKey,
    });
  }
}
