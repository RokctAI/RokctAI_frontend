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
