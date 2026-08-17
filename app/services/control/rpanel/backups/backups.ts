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

export class BackupsService {
  static async getBackups(website?: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.site_backup.site_backup.get_backups",
      { website },
    );
  }

  static async createBackup(website: string, backup_type: string = "Full") {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.site_backup.site_backup.create_backup",
      { website, backup_type },
    );
  }

  static async deleteBackup(backup_id: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.site_backup.site_backup.delete_backup",
      { backup_id },
    );
  }

  static async restoreBackup(backup_id: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.site_backup.site_backup.restore_backup",
      { backup_id },
    );
  }
}
