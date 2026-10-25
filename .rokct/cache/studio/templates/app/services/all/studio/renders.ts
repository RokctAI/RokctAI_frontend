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
import type { DeliverableOptions } from "@/app/actions/studio/renders/types";

export class RenderService {
  static preview(candidate: string, construction = false) {
    return paasCall<{ png_url: string }>("api.print_shop.render_preview", {
      candidate,
      construction: construction ? 1 : 0,
    });
  }

  /** Press-ready vector PDF (CMYK, bleed and marks for print formats). */
  static deliverable(candidate: string, options: DeliverableOptions = {}) {
    return paasCall<{ pdf_url: string }>("api.design_request.render_deliverable", {
      candidate,
      format: options.format,
      cmyk: options.cmyk === false ? 0 : 1,
      marks: options.marks === false ? 0 : 1,
      construction: options.construction ? 1 : 0,
    });
  }

  static pages(candidates: string[], format?: string) {
    return paasCall<{ pdf_url: string }>("api.print_shop.render_pages", { candidates, format });
  }

  static brandbook(designSystem: string, logoFileUrl?: string) {
    return paasCall<{ pdf_url: string }>("api.print_shop.brandbook", {
      design_system: designSystem,
      logo_file_url: logoFileUrl,
    });
  }
}
