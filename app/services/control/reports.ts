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

import { ControlBaseService } from "./base";
import { getSystemControlClient, getControlClient } from "@/app/lib/client";

export interface ReportDefinition {
  name?: string;
  title: string;
  category: string;
  sql: string;
  chart_type: "bar" | "line" | "pie" | "doughnut" | "table";
  x_axis_field?: string;
  y_axis_field?: string;
  description?: string;
  is_active: boolean;
}

export class ReportService {
  static async getGlobalReports(): Promise<ReportDefinition[]> {
    const frappe = await getSystemControlClient(); // Keeping System Client as per original
    const items = await (frappe.db() as any).get_list(
      "SaaS Configuration Item",
      {
        filters: { category: "Report Definition" },
        fields: [
          "name",
          "key",
          "label",
          "description",
          "is_active",
          "creation",
        ],
        limit: 100,
      },
    );

    return items
      .map((item: any) => {
        try {
          const def = JSON.parse(item.description);
          def.name = item.name;
          return def;
        } catch (e) {
          return null;
        }
      })
      .filter((r: any) => r !== null);
  }

  static async saveGlobalReport(report: ReportDefinition) {
    const client = await getControlClient();
    const key = `Report::${report.title.substring(0, 20).replace(/\s+/g, "_")}`;

    if (report.name) {
      return (client.db() as any).set_value(
        "SaaS Configuration Item",
        report.name,
        {
          description: JSON.stringify(report),
          key: key,
          label: report.title,
          category: "Report Definition",
          region: "All",
          is_active: report.is_active ? 1 : 0,
        },
      );
    } else {
      return (client.db() as any).insert({
        doctype: "SaaS Configuration Item",
        category: "Report Definition",
        label: report.title,
        key: key,
        region: "All",
        is_active: report.is_active ? 1 : 0,
        description: JSON.stringify(report),
      });
    }
  }

  static async deleteGlobalReport(name: string) {
    return ControlBaseService.delete("SaaS Configuration Item", name);
  }
}
