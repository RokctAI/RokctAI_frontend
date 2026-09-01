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

export class LogsService {
  static async getLogStats(website: string) {
    return ControlBaseService.call("rpanel.hosting.log_viewer.get_log_stats", {
      website_name: website,
    });
  }

  static async getLogContent(
    website: string,
    logType: string,
    lines: number = 100,
  ) {
    let method = "";
    switch (logType) {
      case "nginx_access":
        method = "get_nginx_access_log";
        break;
      case "nginx_error":
        method = "get_nginx_error_log";
        break;
      case "php_error":
        method = "get_php_error_log";
        break;
      case "application":
        method = "get_application_log";
        break;
      default:
        throw new Error("Invalid log type");
    }
    return ControlBaseService.call(`rpanel.hosting.log_viewer.${method}`, {
      website_name: website,
      lines,
    });
  }

  static async clearLog(website: string, logType: string) {
    return ControlBaseService.call("rpanel.hosting.log_viewer.clear_log", {
      website_name: website,
      log_type: logType,
    });
  }
}
