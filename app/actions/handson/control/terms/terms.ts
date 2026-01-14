"use server";

import { TermsService } from "@/app/services/control/terms";
import { revalidatePath } from "next/cache";

export async function getMasterTerms() {
    return TermsService.getMasterTerms();
}

export async function saveMasterTerm(name: string | undefined, title: string, terms: string) {
    await TermsService.saveMasterTerm(name, title, terms);
    revalidatePath("/handson/control/terms");
    return { success: true };
}

export async function deleteMasterTerm(name: string) {
    await TermsService.deleteMasterTerm(name);
    revalidatePath("/handson/control/terms");
    return { success: true };
}
