/*
 * Copyright (c) 2026 RokctAI
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
