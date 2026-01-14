"use server";

import { revalidatePath } from "next/cache";
import { TravelService } from "@/app/services/all/hrms/travel";

export async function createTravelRequest(data: any) {
    try {
        const result = await TravelService.createRequest(data);
        revalidatePath("/handson/all/hrms/travel");
        return { success: true, message: result };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getTravelRequests() {
    try {
        return await TravelService.getRequests();
    } catch (e) {
        console.error("Failed to fetch travel requests", e);
        return [];
    }
}
