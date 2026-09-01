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

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getStories() {
  try {
    const stories = await paasCall("api.seller_story.get_seller_stories");
    return stories;
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return [];
  }
}

export async function createStory(data: any) {
  try {
    const story = await paasCall("api.seller_story.create_seller_story", {
      story_data: data,
    });
    revalidatePath("/paas/dashboard/content/stories");
    return story;
  } catch (error) {
    console.error("Failed to create story:", error);
    throw error;
  }
}

export async function deleteStory(id: string) {
  try {
    await paasCall("api.seller_story.delete_seller_story", {
      story_name: id,
    });
    revalidatePath("/paas/dashboard/content/stories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete story:", error);
    throw error;
  }
}
