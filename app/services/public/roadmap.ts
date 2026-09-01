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

import { getGuestClient } from "@/app/lib/client";

export class RoadmapPublicService {
  static async getPublicRoadmap() {
    const client = await getGuestClient();
    return (client as any).call(
      "rcore.roadmap.doctype.roadmap_settings.roadmap_settings.get_public_roadmap_content",
    );
  }
}
