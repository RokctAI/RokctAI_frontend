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

import { auth } from "@/app/(auth)/auth";
import {
  Engram,
  EngramSearchResult,
  EngramSemanticResult,
  MemoryService,
} from "@/app/services/all/agent/memory";

// The Brain backend enforces login plus per-document frappe permissions, and
// the host app defines no agent-specific role, so these actions are
// session-gated (any authenticated user) rather than role-gated.
async function verifySession() {
  const session = await auth();
  return !!session?.user?.email;
}

export async function getEngram(doctype: string, name: string) {
  if (!(await verifySession()))
    return { data: null as Engram | null, error: "Unauthorized" };

  try {
    const data = await MemoryService.query(doctype, name);
    return { data };
  } catch (e) {
    console.error("Failed to query Brain memory", e);
    return { data: null as Engram | null, error: "Failed to query Brain memory" };
  }
}

export async function searchEngrams(params: {
  module?: string;
  moduleGroup?: string;
  involvedUser?: string;
  limit?: number;
}) {
  if (!(await verifySession()))
    return { data: [] as EngramSearchResult[], error: "Unauthorized" };

  try {
    const data = await MemoryService.search(params);
    return { data };
  } catch (e) {
    console.error("Failed to search Brain memory", e);
    return {
      data: [] as EngramSearchResult[],
      error: "Failed to search Brain memory",
    };
  }
}

export async function semanticSearchEngrams(
  query: string,
  limit = 5,
  involvedUser?: string,
) {
  if (!(await verifySession()))
    return { data: [] as EngramSemanticResult[], error: "Unauthorized" };

  try {
    const data = await MemoryService.semanticSearch(query, limit, involvedUser);
    return { data };
  } catch (e) {
    console.error("Failed to run semantic search", e);
    return {
      data: [] as EngramSemanticResult[],
      error: "Failed to run semantic search",
    };
  }
}

export async function recordEngramEvent(params: {
  message: string;
  referenceDoctype: string;
  referenceName: string;
  isAiAction?: boolean;
}) {
  if (!(await verifySession())) return { success: false, error: "Unauthorized" };

  try {
    await MemoryService.recordEvent(
      params.message,
      params.referenceDoctype,
      params.referenceName,
      params.isAiAction ?? false,
    );
    return { success: true };
  } catch (e: any) {
    console.error("Failed to record event", e);
    return { success: false, error: e?.message || "Failed to record event" };
  }
}
