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


// Studio gateway cmds, each whitelisted by studio's own frappe/manifest.json
// (cmd co-location rule, SDK_ECOSYSTEM.md).

import { paasCall } from "@/app/services/base/platform-gateway";
import type { DocumentStatus, NewDocumentRequest } from "@/app/actions/studio/documents/types";

export class DocumentService {
  static list(page = 1) {
    return paasCall<any[]>("api.document_request.list_document_requests", { page });
  }

  static create(values: NewDocumentRequest) {
    return paasCall<{ name: string }>("api.document_request.create_document_request", values);
  }

  static queue(name: string) {
    return paasCall<{ name: string; status: string }>("api.document_request.queue_document_request", { name });
  }

  static status(name: string) {
    return paasCall<DocumentStatus>("api.document_request.get_document_status", { name });
  }
}
