"use server";

import { DashboardService } from "@/app/services/control/rpanel/dashboard/dashboard";
import { ControlBaseService } from "@/app/services/control/base";

export async function getServerInfo() {
  try {
    const [infoRes, versionRes] = await Promise.allSettled([
      DashboardService.getServerInfo(),
      ControlBaseService.call("rpanel.api.get_version")
    ]);

    const info = infoRes.status === 'fulfilled' ? (infoRes.value.message || infoRes.value) : {};
    const version = versionRes.status === 'fulfilled' ? (versionRes.value.message || versionRes.value) : null;

    return {
      message: {
        ...info,
        version: version
      }
    };
  } catch (e: any) {
    return { message: { success: false, error: e.message } };
  }
}
