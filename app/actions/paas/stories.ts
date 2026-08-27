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
