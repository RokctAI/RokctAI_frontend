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

import { getControlClient, getSystemControlClient } from "@/app/lib/client";

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
    const items = await (frappe.db() as any).get_list(
      "SaaS Configuration Item",
      {
        filters: { category: CATEGORY },
        fields: [
          "name",
          "label",
          "description",
          "is_active",
          "creation",
          "region",
        ],
        limit: 100,
      },
    );

    return items
      .map((item: any) => {
        try {
          const data = JSON.parse(item.description);
          data.name = item.name;
          data.creation = item.creation;
          return data;
        } catch (e) {
          return null;
        }
      })
      .filter((a: any) => a !== null);
  }

  static async saveGlobalAnnouncement(ann: Announcement) {
    const frappe = await getControlClient();
    const key = `Announce::${Date.now()}`;
    const payload = {
      label: ann.title.substring(0, 140),
      key: key,
      category: CATEGORY,
      is_active: ann.is_active ? 1 : 0,
      description: JSON.stringify(ann),
      region: "All",
    };

    if (ann.name) {
      return (frappe.db() as any).set_value(
        "SaaS Configuration Item",
        ann.name,
        payload,
      );
    } else {
      return (frappe.db() as any).insert({
        doctype: "SaaS Configuration Item",
        ...payload,
      });
    }
  }

  static async deleteGlobalAnnouncement(name: string) {
    const frappe = await getControlClient();
    return (frappe.db() as any).delete_doc("SaaS Configuration Item", name);
  }
}
