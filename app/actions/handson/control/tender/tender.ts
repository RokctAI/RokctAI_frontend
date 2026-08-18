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

// [SDK-MANAGED] The canonical copy of this file lives in the tender module
// (corporate/tender/nextjs/templates/...). Edits here should be mirrored there.

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
//
// "Generated Tender Task" and "Tender Workflow Task" are child tables, so
// their actions carry the parent document name (Intelligent Task Set /
// Tender Workflow Template) — child rows can only be written via the parent.

export async function updateTenderControlSettings(data: any) {
  const doc = await TenderService.updateTenderControlSettings(data);
  revalidatePath("/handson/control/tender");
  return doc;
}

export async function createGeneratedTenderTask(taskSet: string, data: any) {
  const doc = await TenderService.createGeneratedTenderTask(taskSet, data);
  revalidatePath("/handson/control/tender");
  return doc;
}

export async function updateGeneratedTenderTask(
  taskSet: string,
  name: string,
  data: any,
) {
  const doc = await TenderService.updateGeneratedTenderTask(
    taskSet,
    name,
    data,
  );
  revalidatePath("/handson/control/tender");
  return doc;
}

export async function deleteGeneratedTenderTask(taskSet: string, name: string) {
  await TenderService.deleteGeneratedTenderTask(taskSet, name);
  revalidatePath("/handson/control/tender");
}

export async function createTenderWorkflowTask(template: string, data: any) {
  const doc = await TenderService.createTenderWorkflowTask(template, data);
  revalidatePath("/handson/control/tender");
  return doc;
}

export async function updateTenderWorkflowTask(
  template: string,
  name: string,
  data: any,
) {
  const doc = await TenderService.updateTenderWorkflowTask(
    template,
    name,
    data,
  );
  revalidatePath("/handson/control/tender");
  return doc;
}

export async function deleteTenderWorkflowTask(template: string, name: string) {
  await TenderService.deleteTenderWorkflowTask(template, name);
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
