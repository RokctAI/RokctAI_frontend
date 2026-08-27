/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
