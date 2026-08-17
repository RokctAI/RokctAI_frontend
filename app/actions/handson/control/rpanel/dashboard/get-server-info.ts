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
