/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { HandsonBaseService } from "./base";

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
}
