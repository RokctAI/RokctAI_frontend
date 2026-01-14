"use server";

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getStrategicObjectives(pillarName?: string) {
    try {
        const res = await StrategyService.getStrategicObjectives(pillarName);
        return res.data;
    } catch (e) { return []; }
}

export async function createStrategicObjective(data: any) {
    try {
        const res = await StrategyService.createStrategicObjective(data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function updateStrategicObjective(name: string, data: any) {
    try {
        const res = await StrategyService.updateStrategicObjective(name, data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function deleteStrategicObjective(name: string) {
    try {
        await StrategyService.deleteStrategicObjective(name);
        revalidatePath("/handson/all/projects/strategy");
    } catch (e) { }
}
