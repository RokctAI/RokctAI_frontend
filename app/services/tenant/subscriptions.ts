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

import { getClient } from "@/app/lib/client";

export class SubscriptionService {
  static async getSubscriptionStatus() {
    const client = await getClient();
    try {
      const response = await (client as any).call({
        method: "core.tenant.api.get_subscription_details",
        args: {},
      });
      return response?.message || { plan_name: "Simple", status: "Active" };
    } catch (e) {
      return { plan_name: "Simple", status: "Active" };
    }
  }
}
