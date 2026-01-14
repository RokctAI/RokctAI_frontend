"use server";

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getPillars(visionName?: string) {
    try {
        const res = await StrategyService.getPillars(visionName);
        return res.data;
    } catch (e) { return []; }
}

export async function createPillar(data: any) {
    try {
        const res = await StrategyService.createPillar(data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function updatePillar(name: string, data: any) {
    try {
        const res = await StrategyService.updatePillar(name, data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function deletePillar(name: string) {
    try {
        await StrategyService.deletePillar(name);
        revalidatePath("/handson/all/projects/strategy");
    } catch (e) { }
}
