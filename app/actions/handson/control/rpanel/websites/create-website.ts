"use server";

import { revalidatePath } from "next/cache";
import { WebsitesService } from "@/app/services/control/rpanel/websites/websites";

export async function createWebsite(data: any) {
  try {
    const res = await WebsitesService.createWebsite(data);

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/websites");
    return { success: true, data: res.data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
