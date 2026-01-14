"use server";

import { revalidatePath } from "next/cache";
import { FtpService } from "@/app/services/control/rpanel/ftp/ftp";

export async function getFtpAccounts(clientName?: string) {
    try {
        const res = await FtpService.getClientFtpAccounts(clientName);
        return { message: res.message || res };
    } catch (e: any) {
        return { message: { success: false, error: e.message } };
    }
}

export async function createFtpAccount(website: string, username: string, password: string) {
    try {
        const res = await FtpService.createFtpAccount(website, username, password);

        if (res.exc) throw new Error(JSON.stringify(res.exc));

        revalidatePath("/rpanel/ftp");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateFtpPassword(name: string, newPassword: string) {
    try {
        const res = await FtpService.updateFtpPassword(name, newPassword);

        if (res.exc) throw new Error(JSON.stringify(res.exc));

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteFtpAccount(name: string) {
    try {
        const res = await FtpService.deleteFtpAccount(name);

        if (res && res.exc) throw new Error(JSON.stringify(res.exc));

        revalidatePath("/rpanel/ftp");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
