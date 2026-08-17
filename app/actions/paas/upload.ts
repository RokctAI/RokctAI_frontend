"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    // Convert file to base64 for transmission
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const result = await paasCall("api.upload.upload_file", {
        file: base64,
        filename: file.name,
        is_private: 0,
      });

    return result;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}
