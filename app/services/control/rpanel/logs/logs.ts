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
