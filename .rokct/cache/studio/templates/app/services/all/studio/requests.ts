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
import type { NewDesignRequest, PosterTemplate, RequestStatus } from "@/app/actions/studio/requests/types";

export class RequestService {
  static list(page = 1) {
    return paasCall<any[]>("api.design_request.list_requests", { page });
  }

  static create(values: NewDesignRequest) {
    return paasCall<{ name: string }>("api.design_request.create_design_request", {
      ...values,
      file_urls: values.file_urls ? JSON.stringify(values.file_urls) : undefined,
      template_data: values.template_data ? JSON.stringify(values.template_data) : undefined,
    });
  }

  /** Poster templates for source_mode "Template", with their slots. */
  static templates() {
    return paasCall<PosterTemplate[]>("api.design_request.list_templates", {});
  }

  static queue(name: string) {
    return paasCall<{ name: string; status: string }>("api.design_request.queue_design_request", { name });
  }

  static status(name: string) {
    return paasCall<RequestStatus>("api.design_request.get_request_status", { name });
  }

  static select(candidate: string) {
    return paasCall<{ svg_url: string }>("api.design_request.select_candidate", { candidate });
  }

  static candidateSvg(candidate: string) {
    return paasCall<{ svg: string; score: number | null; report_json: string | null }>(
      "api.design_request.get_candidate_svg",
      { candidate },
    );
  }

  static saveEdit(candidate: string, svg: string) {
    return paasCall<{ svg: string; score: number; report_json: string; revision: string }>(
      "api.design_request.save_candidate_edit",
      { candidate, svg },
    );
  }

  /** Base64 (data URI) file -> private File url the other cmds take. */
  static upload(fileData: string, filename: string) {
    return paasCall<{ file_url: string }>("api.design_request.upload_file", {
      file_data: fileData,
      filename,
    });
  }

  /** Fix uploaded artwork to the brand (no generation). */
  static comply(fileUrl: string, designSystem?: string, format?: string) {
    return paasCall<RequestStatus>("api.design_request.comply_upload", {
      file_url: fileUrl,
      design_system: designSystem,
      format,
    });
  }

  /** Read-only brand check of uploaded artwork. */
  static audit(fileUrl: string, designSystem?: string) {
    return paasCall<{ score: number; report_json: string }>("api.design_request.audit_upload", {
      file_url: fileUrl,
      design_system: designSystem,
    });
  }
}


