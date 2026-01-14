"use server";

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getKPIs(objectiveName?: string) {
    try {
        const res = await StrategyService.getKPIs(objectiveName);
        return res.data;
    } catch (e) { return []; }
}

export async function createKPI(data: any) {
    try {
        const res = await StrategyService.createKPI(data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function updateKPI(name: string, data: any) {
    try {
        const res = await StrategyService.updateKPI(name, data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function deleteKPI(name: string) {
    try {
        await StrategyService.deleteKPI(name);
        revalidatePath("/handson/all/projects/strategy");
    } catch (e) { }
}
