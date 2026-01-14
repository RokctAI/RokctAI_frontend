"use server";

import { RoadmapService } from "@/app/services/control/roadmap";

export async function getRoadmaps() {
    return RoadmapService.getRoadmaps();
}

export async function getRoadmapFeatures(roadmapName: string) {
    return RoadmapService.getRoadmapFeatures(roadmapName);
}

export async function createRoadmap(data: any) {
    return RoadmapService.createRoadmap(data);
}

export async function updateRoadmap(name: string, data: any) {
    return RoadmapService.updateRoadmap(name, data);
}

export async function deleteRoadmap(name: string) {
    await RoadmapService.deleteRoadmap(name);
    return { success: true };
}

export async function createRoadmapFeature(data: any) {
    return RoadmapService.createRoadmapFeature(data);
}

export async function updateRoadmapFeature(name: string, data: any) {
    return RoadmapService.updateRoadmapFeature(name, data);
}

export async function deleteRoadmapFeature(name: string) {
    await RoadmapService.deleteRoadmapFeature(name);
    return { success: true };
}
