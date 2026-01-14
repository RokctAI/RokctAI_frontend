"use server";

import { revalidatePath } from "next/cache";
import { EmailsService } from "@/app/services/control/rpanel/emails/emails";

export async function getEmails(clientName?: string) {
    try {
        const res = await EmailsService.getClientEmails(clientName);
        return { message: res.message || res };
    } catch (e: any) {
        return { message: { success: false, error: e.message } };
    }
}

export async function createEmailAccount(website: string, emailUser: string, password: string) {
    try {
        const res = await EmailsService.createEmailAccount(website, emailUser, password);

        if (res.exc) throw new Error(JSON.stringify(res.exc));

        revalidatePath("/rpanel/emails");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateEmailPassword(website: string, emailUser: string, newPassword: string) {
    try {
        const res = await EmailsService.updateEmailPassword(website, emailUser, newPassword);

        if (res.exc) throw new Error(JSON.stringify(res.exc));

        revalidatePath("/rpanel/emails");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteEmailAccount(website: string, emailUser: string) {
    try {
        const res = await EmailsService.deleteEmailAccount(website, emailUser);

        if (res.exc) throw new Error(JSON.stringify(res.exc));

        revalidatePath("/rpanel/emails");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
