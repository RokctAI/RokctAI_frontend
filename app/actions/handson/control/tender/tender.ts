/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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
