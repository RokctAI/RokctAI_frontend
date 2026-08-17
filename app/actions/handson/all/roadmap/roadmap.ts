/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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

export async function assignToJules(
  docname: string,
  feature: string,
  explanation: string,
) {
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

export async function voteOnPlan(
  sessionId: string,
  action: "approve",
  apiKey?: string,
) {
  const res = await RoadmapService.voteOnPlan(sessionId, action, apiKey);
  revalidatePath("/handson/all/roadmap");
  return res;
}

export async function sendJulesMessage(
  sessionId: string,
  message: string,
  apiKey?: string,
) {
  const res = await RoadmapService.sendJulesMessage(sessionId, message, apiKey);
  revalidatePath("/handson/all/roadmap");
  return res;
}
