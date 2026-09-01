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

"use server";

import { DashboardService } from "@/app/services/control/rpanel/dashboard/dashboard";
import { ControlBaseService } from "@/app/services/control/base";

export async function getServerInfo() {
  try {
    const [infoRes, versionRes] = await Promise.allSettled([
      DashboardService.getServerInfo(),
      ControlBaseService.call("rpanel.api.get_version"),
    ]);

    const info =
      infoRes.status === "fulfilled"
        ? infoRes.value.message || infoRes.value
        : {};
    const version =
      versionRes.status === "fulfilled"
        ? versionRes.value.message || versionRes.value
        : null;

    return {
      message: {
        ...info,
        version: version,
      },
    };
  } catch (e: any) {
    return { message: { success: false, error: e.message } };
  }
}
