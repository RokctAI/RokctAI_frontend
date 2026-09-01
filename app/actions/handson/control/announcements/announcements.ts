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

"use server";

import {
  AnnouncementService,
  type Announcement,
} from "@/app/services/control/announcements";
import { revalidatePath } from "next/cache";

export type { Announcement };

export async function getGlobalAnnouncements(): Promise<Announcement[]> {
  return AnnouncementService.getGlobalAnnouncements();
}

export async function saveGlobalAnnouncement(ann: Announcement) {
  await AnnouncementService.saveGlobalAnnouncement(ann);
  revalidatePath("/handson/control/announcements");
  return { success: true };
}

export async function deleteGlobalAnnouncement(name: string) {
  await AnnouncementService.deleteGlobalAnnouncement(name);
  revalidatePath("/handson/control/announcements");
  return { success: true };
}

export async function seedAnnouncements() {
  const examples: Announcement[] = [
    {
      title: "Welcome to Rokct 2.0!",
      content:
        "We have updated the interface with a new dark mode option. Check Settings.",
      target_plans: ["All"],
      is_active: true,
    },
    {
      title: "Enterprise Maintenance Window",
      content:
        "Your dedicated server will undergo maintenance on Sunday 2AM UTC.",
      target_plans: ["Enterprise", "Pro"],
      is_active: true,
    },
  ];

  for (const ex of examples) {
    await saveGlobalAnnouncement(ex);
  }
}
