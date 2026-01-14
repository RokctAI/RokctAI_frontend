"use server";

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export async function getRoutings() {
    try {
        const res = await ManufacturingService.getRoutings();
        return res.data;
    } catch (e) { return []; }
}

export async function createRouting(data: { routing_name: string; operations: { operation: string; workstation: string; time_in_mins: number }[] }) {
    try {
        const res = await ManufacturingService.createRouting(data);
        // Assuming there is a routing page or it lives in shop floor? 
        // supply_chain.ts didn't have specific revalidate for routing other than generally maybe?
        // Let's assume manufacturing root for now or shop floor
        revalidatePath("/handson/all/accounting/manufacturing");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
