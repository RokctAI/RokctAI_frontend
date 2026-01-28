"use server";

import { revalidatePath } from "next/cache";
import { RoadmapService } from "@/app/services/handson/roadmap";

export async function getRoadmaps() {
    return await RoadmapService.getRoadmaps();
}

export async function getRoadmapFeatures(roadmapName: string) {
    return await RoadmapService.getRoadmapFeatures(roadmapName);
}

export async function getRoadmap(name: string) {
    return await RoadmapService.getRoadmap(name);
}

export async function createRoadmap(data: any) {
    const res = await RoadmapService.createRoadmap(data);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function updateRoadmap(name: string, data: any) {
    const res = await RoadmapService.updateRoadmap(name, data);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function deleteRoadmap(name: string) {
    const res = await RoadmapService.deleteRoadmap(name);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function createRoadmapFeature(data: any) {
    const res = await RoadmapService.createRoadmapFeature(data);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function updateRoadmapFeature(name: string, data: any) {
    const res = await RoadmapService.updateRoadmapFeature(name, data);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function deleteRoadmapFeature(name: string) {
    const res = await RoadmapService.deleteRoadmapFeature(name);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function assignToJules(docname: string, feature: string, explanation: string) {
    const res = await RoadmapService.assignToJules(docname, feature, explanation);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function getJulesSources(apiKey?: string) {
    return await RoadmapService.getJulesSources(apiKey);
}

export async function triggerJules() {
    return await RoadmapService.triggerJules();
}

export async function discoverRoadmapContext(name: string) {
    return await RoadmapService.discoverContext(name);
}

export async function generateOneRoadmapIdeas(name: string) {
    return await RoadmapService.generateIdeas(name);
}

export async function setPublicRoadmap(roadmapName: string | null) {
    const res = await RoadmapService.setPublicRoadmap(roadmapName);
    revalidatePath("/handson/all/roadmap");
    revalidatePath("/public/roadmap"); // Revalidate public page too
    return res;
}


export async function getGlobalSettings() {
    return await RoadmapService.getGlobalSettings();
}

export async function getPublicRoadmapSetting() {
    return await RoadmapService.getGlobalSettings();
}

// --- Interactive Jules ---

export async function getJulesStatus(sessionId: string, apiKey?: string) {
    return await RoadmapService.getJulesStatus(sessionId, apiKey);
}

export async function getJulesActivities(sessionId: string, apiKey?: string) {
    return await RoadmapService.getJulesActivities(sessionId, apiKey);
}

export async function voteOnPlan(sessionId: string, action: "approve", apiKey?: string) {
    const res = await RoadmapService.voteOnPlan(sessionId, action, apiKey);
    revalidatePath("/handson/all/roadmap");
    return res;
}

export async function sendJulesMessage(sessionId: string, message: string, apiKey?: string) {
    const res = await RoadmapService.sendJulesMessage(sessionId, message, apiKey);
    revalidatePath("/handson/all/roadmap");
    return res;
}
