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
