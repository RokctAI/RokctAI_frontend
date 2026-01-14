"use server";

import { getControlClient } from "@/app/lib/client";

export async function getFiles(website: string, path: string) {
    try {
        const client = await getControlClient();
        const res = await client.call("rpanel.hosting.file_manager.get_file_list", {
            website_name: website,
            path: path
        });
        return { success: true, data: res.message };
    } catch (e: any) {
        console.error("Failed to fetch files", e);
        return { success: false, error: e.message || "Unknown error" };
    }
}

export async function deleteFile(website: string, filePath: string) {
    try {
        const client = await getControlClient();
        await client.call("rpanel.hosting.file_manager.delete_file", {
            website_name: website,
            file_path: filePath
        });
        return { success: true };
    } catch (e: any) {
        console.error("Failed to delete file", e);
        return { success: false, error: e.message || "Unknown error" };
    }
}
