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

import { TenantBaseService } from "./base";

export class StorageService {
  static async getStorageUsage() {
    try {
      const client = await import("@/app/lib/client").then((m) =>
        m.getControlClient(),
      );
      const usage = await (client.db() as any).get_value(
        "Storage Tracker",
        "Storage Tracker",
        "current_storage_usage_mb",
      );
      return usage || 0;
    } catch (e) {
      return 0;
    }
  }
}
