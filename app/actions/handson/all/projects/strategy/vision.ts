"use server";

import { StrategyService } from "@/app/services/all/projects/strategy";
import { revalidatePath } from "next/cache";

export async function getVisions() {
    try {
        const res = await StrategyService.getVisions();
        return res.data;
    } catch (e) { return []; }
}

export async function getVision(name: string) {
    try {
        const res = await StrategyService.getVision(name);
        return res.data;
    } catch (e) { return null; }
}

export async function createVision(data: any) {
    try {
        const res = await StrategyService.createVision(data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function updateVision(name: string, data: any) {
    try {
        const res = await StrategyService.updateVision(name, data);
        revalidatePath("/handson/all/projects/strategy");
        return res;
    } catch (e) { return null; }
}

export async function deleteVision(name: string) {
    try {
        await StrategyService.deleteVision(name);
        revalidatePath("/handson/all/projects/strategy");
    } catch (e) { }
}
