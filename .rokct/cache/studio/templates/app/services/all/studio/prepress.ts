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
import type { Construction, Layout, PreflightReport } from "@/app/actions/studio/prepress/types";

export class PrepressService {
  /** Construction guides (informational, never scored). */
  static construction(candidate: string) {
    return paasCall<Construction>("api.print_shop.get_construction", { candidate });
  }

  static preflight(fileData: string, filename: string) {
    return paasCall<PreflightReport>("api.print_shop.preflight_upload", {
      file_data: fileData,
      filename,
    });
  }

  static impose(fileUrl: string, sheet: string, quantity?: number) {
    return paasCall<{ pdf_url: string; layout: Layout }>("api.print_shop.impose_upload", {
      file_url: fileUrl,
      sheet,
      quantity,
    });
  }

  static sheets() {
    return paasCall<Record<string, [number, number]>>("api.print_shop.list_sheets", {});
  }
}
