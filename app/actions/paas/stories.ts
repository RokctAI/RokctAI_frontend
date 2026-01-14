"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getStories() {
    const frappe = await getPaaSClient();

    try {
        const stories = await frappe.call({
            method: "paas.api.seller_story.seller_story.get_seller_stories"
        });
        return stories;
    } catch (error) {
        console.error("Failed to fetch stories:", error);
        return [];
    }
}

export async function createStory(data: any) {
    const frappe = await getPaaSClient();

    try {
        const story = await frappe.call({
            method: "paas.api.seller_story.seller_story.create_seller_story",
            args: {
                story_data: data
            }
        });
        revalidatePath("/paas/dashboard/content/stories");
        return story;
    } catch (error) {
        console.error("Failed to create story:", error);
        throw error;
    }
}

export async function deleteStory(id: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_story.seller_story.delete_seller_story",
            args: {
                story_name: id
            }
        });
        revalidatePath("/paas/dashboard/content/stories");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete story:", error);
        throw error;
    }
}
