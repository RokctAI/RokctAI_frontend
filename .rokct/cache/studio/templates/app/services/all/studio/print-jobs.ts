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
import type { PreparedJob } from "@/app/actions/studio/print-jobs/types";

export class PrintJobService {
  static list(status?: string) {
    return paasCall<any[]>("api.print_shop.list_print_jobs", { status });
  }

  static get(printJob: string) {
    return paasCall<any>("api.print_shop.get_print_job", { print_job: printJob });
  }

  static update(printJob: string, values: Record<string, unknown>) {
    return paasCall<any>("api.print_shop.update_print_job", { print_job: printJob, values });
  }

  /** Press PDF + imposed sheet + job ticket in one go. */
  static prepare(printJob: string, sheet?: string, quantity?: number) {
    return paasCall<PreparedJob>("api.print_shop.prepare_print_job", {
      print_job: printJob,
      sheet,
      quantity,
    });
  }
}
