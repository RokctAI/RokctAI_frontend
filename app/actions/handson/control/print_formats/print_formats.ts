"use server";

import { PrintFormatService, MasterPrintFormat } from "@/app/services/control/print_formats";
import { revalidatePath } from "next/cache";

export type { MasterPrintFormat };

/**
 * Fetches all Print Formats from the Control Site.
 */
export async function getMasterPrintFormats(doctype?: string) {
    return PrintFormatService.getMasterPrintFormats(doctype);
}

/**
 * Creates or Updates a Master Print Format.
 */
export async function saveMasterPrintFormat(name: string, doctype: string, html: string) {
    await PrintFormatService.saveMasterPrintFormat(name, doctype, html);
    revalidatePath("/handson/control/print-formats");
    return { success: true };
}

export async function deleteMasterPrintFormat(name: string) {
    await PrintFormatService.deleteMasterPrintFormat(name);
    revalidatePath("/handson/control/print-formats");
    return { success: true };
}
