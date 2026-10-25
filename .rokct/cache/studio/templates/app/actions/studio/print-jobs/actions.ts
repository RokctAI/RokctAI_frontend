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

import { revalidatePath } from "next/cache";

import { PrintJobService } from "@/app/services/all/studio/print-jobs";

export async function listPrintJobs(status?: string) {
  try {
    return await PrintJobService.list(status);
  } catch (error) {
    console.error("Failed to fetch print jobs:", error);
    return [];
  }
}

export async function getPrintJob(printJob: string) {
  return PrintJobService.get(printJob);
}

export async function updatePrintJob(printJob: string, values: Record<string, unknown>) {
  const job = await PrintJobService.update(printJob, values);
  revalidatePath(`/studio/print/${printJob}`);
  return job;
}

export async function preparePrintJob(printJob: string, sheet?: string, quantity?: number) {
  const out = await PrintJobService.prepare(printJob, sheet, quantity);
  revalidatePath(`/studio/print/${printJob}`);
  return out;
}
