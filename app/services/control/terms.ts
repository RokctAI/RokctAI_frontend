/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import {
  getSystemControlClient,
  getControlClient,
  getClient,
} from "@/app/lib/client";

export class TermsService {
  static async getMasterTerms() {
    const frappe = await getSystemControlClient();
    return (frappe.db() as any).getDocList("Terms and Conditions", {
      fields: ["name", "title", "terms", "disabled"],
      filters: { disabled: 0 },
      limit: 100,
    });
  }

  static async getSystemTerm(name: string) {
    const frappe = await getSystemControlClient();
    return (frappe.db() as any).getDoc("Terms and Conditions", name);
  }

  static async saveMasterTerm(
    name: string | undefined,
    title: string,
    terms: string,
  ) {
    const frappe = await getControlClient();
    if (name) {
      return (frappe.db() as any).updateDoc("Terms and Conditions", name, {
        title: title,
        terms: terms,
      });
    } else {
      return (frappe.db() as any).createDoc("Terms and Conditions", {
        title: title,
        terms: terms,
      });
    }
  }

  static async deleteMasterTerm(name: string) {
    return ControlBaseService.delete("Terms and Conditions", name);
  }
}
