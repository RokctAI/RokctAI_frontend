"use server";

import { TenderService } from "@/app/services/control/tender";
import { revalidatePath } from "next/cache";

export async function getTenderControlSettings() {
    return TenderService.getTenderControlSettings();
}

export async function getGeneratedTenderTasks() {
    return TenderService.getGeneratedTenderTasks();
}

export async function getTenderWorkflowTasks() {
    return TenderService.getTenderWorkflowTasks();
}

export async function getTenderWorkflowTemplates() {
    return TenderService.getTenderWorkflowTemplates();
}

export async function getIntelligentTaskSets() {
    return TenderService.getIntelligentTaskSets();
}

// CRUD Actions

export async function updateTenderControlSettings(name: string, data: any) {
    const doc = await TenderService.updateTenderControlSettings(name, data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function createGeneratedTenderTask(data: any) {
    const doc = await TenderService.createGeneratedTenderTask(data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function updateGeneratedTenderTask(name: string, data: any) {
    const doc = await TenderService.updateGeneratedTenderTask(name, data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function deleteGeneratedTenderTask(name: string) {
    await TenderService.deleteGeneratedTenderTask(name);
    revalidatePath("/handson/control/tender");
}

export async function createTenderWorkflowTask(data: any) {
    const doc = await TenderService.createTenderWorkflowTask(data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function updateTenderWorkflowTask(name: string, data: any) {
    const doc = await TenderService.updateTenderWorkflowTask(name, data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function deleteTenderWorkflowTask(name: string) {
    await TenderService.deleteTenderWorkflowTask(name);
    revalidatePath("/handson/control/tender");
}

export async function createTenderWorkflowTemplate(data: any) {
    const doc = await TenderService.createTenderWorkflowTemplate(data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function updateTenderWorkflowTemplate(name: string, data: any) {
    const doc = await TenderService.updateTenderWorkflowTemplate(name, data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function deleteTenderWorkflowTemplate(name: string) {
    await TenderService.deleteTenderWorkflowTemplate(name);
    revalidatePath("/handson/control/tender");
}

export async function createIntelligentTaskSet(data: any) {
    const doc = await TenderService.createIntelligentTaskSet(data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function updateIntelligentTaskSet(name: string, data: any) {
    const doc = await TenderService.updateIntelligentTaskSet(name, data);
    revalidatePath("/handson/control/tender");
    return doc;
}

export async function deleteIntelligentTaskSet(name: string) {
    await TenderService.deleteIntelligentTaskSet(name);
    revalidatePath("/handson/control/tender");
}
