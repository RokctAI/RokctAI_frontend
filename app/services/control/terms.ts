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
