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

import { ControlBaseService } from "../../base";

export class CronService {
  static async getCronJobs(website?: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.cron_job.cron_job.get_cron_jobs",
      { website },
    );
  }

  static async createCronJob(data: any) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.cron_job.cron_job.create_cron_job",
      { ...data },
    );
  }

  static async updateCronJob(name: string, data: any) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.cron_job.cron_job.update_cron_job",
      { name, ...data },
    );
  }

  static async deleteCronJob(name: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.cron_job.cron_job.delete_cron_job",
      { name },
    );
  }
}
