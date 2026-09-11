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

import { BaseService, ServiceOptions } from "@/app/services/common/base";

// Calls agent/agent/frappe's Brain module via its manifest.json whitelisted
// aliases. Unlike other SDKs the agent backend whitelists a FLAT namespace —
// "{app_name}.api.<fn>" with no domain segment, named to the gateway as the
// prefix-free key "api.<fn>". Do not invent a different path here.
const NS = "api";

export interface Engram {
  name: string;
  brain_version?: string;
  [key: string]: unknown;
}

export interface EngramSearchResult {
  name: string;
  reference_doctype: string;
  reference_name: string;
  reference_title: string | null;
  module: string | null;
  summary: string | null;
  last_activity_date: string | null;
}

export interface EngramSemanticResult {
  name: string;
  reference_doctype: string;
  reference_name: string;
  reference_title: string | null;
  summary: string | null;
  distance: number;
}

export class MemoryService {
  /** Fetch the Engram (memory record) for a specific document. */
  static async query(
    doctype: string,
    name: string,
    options?: ServiceOptions,
  ): Promise<Engram | null> {
    const response = await BaseService.call(
      `${NS}.query`,
      { doctype, name },
      options,
    );
    return response?.message || null;
  }

  /** Metadata search over Engrams (module / module group / involved user). */
  static async search(
    params: {
      module?: string;
      moduleGroup?: string;
      involvedUser?: string;
      limit?: number;
    } = {},
    options?: ServiceOptions,
  ): Promise<EngramSearchResult[]> {
    const response = await BaseService.call(
      `${NS}.search`,
      {
        module: params.module,
        module_group: params.moduleGroup,
        involved_user: params.involvedUser,
        limit: params.limit ?? 20,
      },
      options,
    );
    return response?.message || [];
  }

  /** pgvector similarity search over Engram embeddings. */
  static async semanticSearch(
    query: string,
    limit = 5,
    involvedUser?: string,
    options?: ServiceOptions,
  ): Promise<EngramSemanticResult[]> {
    const response = await BaseService.call(
      `${NS}.semantic_search`,
      { query, limit, involved_user: involvedUser },
      options,
    );
    return response?.message || [];
  }

  /** Record a custom event against a document in the Brain's memory. */
  static async recordEvent(
    message: string,
    referenceDoctype: string,
    referenceName: string,
    isAiAction = false,
    options?: ServiceOptions,
  ): Promise<void> {
    await BaseService.call(
      `${NS}.record_event`,
      {
        message,
        reference_doctype: referenceDoctype,
        reference_name: referenceName,
        is_ai_action: isAiAction ? 1 : 0,
      },
      options,
    );
  }
}
