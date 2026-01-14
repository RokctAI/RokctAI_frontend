"use server";

import { revalidatePath } from "next/cache";
import { VoucherService } from "@/app/services/control/vouchers";

export async function getVouchers() {
    try {
        const list = await VoucherService.getVouchers();
        return { status: "success", data: list };
    } catch (error: any) {
        return { status: "failed", error: error.message };
    }
}

export async function createVoucher(data: any) {
    try {
        const res = await VoucherService.createVoucher(data);
        revalidatePath("/handson/control/vouchers");
        return { status: "success", data: res };
    } catch (error: any) {
        return { status: "failed", error: error.message };
    }
}

export async function updateVoucher(name: string, data: any) {
    try {
        const res = await VoucherService.updateVoucher(name, data);
        revalidatePath("/handson/control/vouchers");
        return { status: "success", data: res };
    } catch (error: any) {
        return { status: "failed", error: error.message };
    }
}

export async function deleteVoucher(name: string) {
    try {
        await VoucherService.deleteVoucher(name);
        revalidatePath("/handson/control/vouchers");
        return { status: "success" };
    } catch (error: any) {
        return { status: "failed", error: error.message };
    }
}
