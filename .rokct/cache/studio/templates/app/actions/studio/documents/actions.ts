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

import { DocumentService } from "@/app/services/all/studio/documents";

import type { NewDocumentRequest } from "./types";

export async function listDocumentRequests(page = 1) {
  try {
    return await DocumentService.list(page);
  } catch (error) {
    console.error("Failed to fetch document requests:", error);
    return [];
  }
}

export async function createDocumentRequest(values: NewDocumentRequest) {
  const out = await DocumentService.create(values);
  revalidatePath("/studio/documents");
  return out;
}

export async function queueDocumentRequest(name: string) {
  const out = await DocumentService.queue(name);
  revalidatePath(`/studio/documents/${name}`);
  return out;
}

export async function getDocumentStatus(name: string) {
  return DocumentService.status(name);
}
