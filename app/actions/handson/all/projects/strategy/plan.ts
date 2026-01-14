"use server";

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getPlanOnAPage() {
    try {
        const res = await StrategyService.getPlanOnAPage();
        return res;
    } catch (e) { return null; }
}

export async function updatePlanOnAPage(data: any) {
    try {
        const doc = await StrategyService.updatePlanOnAPage(data);
        revalidatePath("/handson/all/projects/strategy");
        return doc;
    } catch (e) { return null; }
}
