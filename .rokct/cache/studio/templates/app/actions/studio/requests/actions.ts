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

import { RequestService } from "@/app/services/all/studio/requests";

import type { NewDesignRequest } from "./types";

export async function listRequests(page = 1) {
  try {
    return await RequestService.list(page);
  } catch (error) {
    console.error("Failed to fetch design requests:", error);
    return [];
  }
}

export async function createDesignRequest(values: NewDesignRequest) {
  const out = await RequestService.create(values);
  revalidatePath("/studio");
  return out;
}

export async function listTemplates() {
  try {
    return await RequestService.templates();
  } catch (error) {
    console.error("Failed to fetch poster templates:", error);
    return [];
  }
}

export async function queueDesignRequest(name: string) {
  const out = await RequestService.queue(name);
  revalidatePath(`/studio/requests/${name}`);
  return out;
}

export async function getRequestStatus(name: string) {
  return RequestService.status(name);
}

export async function selectCandidate(candidate: string, request: string) {
  const out = await RequestService.select(candidate);
  revalidatePath(`/studio/requests/${request}`);
  return out;
}

export async function getCandidateSvg(candidate: string) {
  return RequestService.candidateSvg(candidate);
}

export async function saveCandidateEdit(candidate: string, svg: string) {
  return RequestService.saveEdit(candidate, svg);
}

export async function uploadFile(fileData: string, filename: string) {
  return RequestService.upload(fileData, filename);
}

export async function complyUpload(fileUrl: string, designSystem?: string, format?: string) {
  const out = await RequestService.comply(fileUrl, designSystem, format);
  revalidatePath("/studio");
  return out;
}

export async function auditUpload(fileUrl: string, designSystem?: string) {
  return RequestService.audit(fileUrl, designSystem);
}
