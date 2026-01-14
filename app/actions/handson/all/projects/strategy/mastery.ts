"use server";

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getPersonalMasteryGoals() {
    try {
        const res = await StrategyService.getPersonalMasteryGoals();
        return res.data;
    } catch (e) { return []; }
}

export async function createPersonalMasteryGoal(data: any) {
    try {
        const res = await StrategyService.createPersonalMasteryGoal(data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function updatePersonalMasteryGoal(name: string, data: any) {
    try {
        const res = await StrategyService.updatePersonalMasteryGoal(name, data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function deletePersonalMasteryGoal(name: string) {
    try {
        await StrategyService.deletePersonalMasteryGoal(name);
        revalidatePath("/handson/all/projects/strategy");
    } catch (e) { }
}
