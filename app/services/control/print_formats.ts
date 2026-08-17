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
import { getControlClient } from "@/app/lib/client";

export interface MasterPrintFormat {
  name: string;
  doc_type: string;
  html: string;
  standard: boolean;
}

export class PrintFormatService {
  static async getMasterPrintFormats(doctype?: string) {
    const filters: any = {};
    if (doctype) {
      filters.doc_type = doctype;
    }

    return ControlBaseService.getList("Print Format", {
      fields: ["name", "doc_type", "html", "standard"],
      filters: filters,
      limit: 100,
    });
  }

  static async saveMasterPrintFormat(
    name: string,
    doctype: string,
    html: string,
  ) {
    const client = await getControlClient();
    const exists = await (client.db() as any).get_value(
      "Print Format",
      { name: name },
      "name",
    );

    if (exists && exists.message && exists.message.name) {
      return (client.db() as any).update_doc("Print Format", name, {
        html: html,
        doc_type: doctype,
        print_format_type: "Jinja",
      });
    } else {
      return (client.db() as any).create_doc("Print Format", {
        name: name,
        doc_type: doctype,
        html: html,
        print_format_type: "Jinja",
        standard: "No",
      });
    }
  }

  static async deleteMasterPrintFormat(name: string) {
    return ControlBaseService.delete("Print Format", name);
  }
}
