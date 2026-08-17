/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
